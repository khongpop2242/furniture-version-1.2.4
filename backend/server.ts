import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { dbConfig } from './config/database';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any });

// Create MySQL connection pool
const pool = mysql.createPool({
  ...dbConfig,
  port: typeof dbConfig.port === 'string' ? parseInt(dbConfig.port) : dbConfig.port
});

// Middleware
app.use(cors());
// ต้องใช้ raw body สำหรับ webhook เท่านั้น ส่วนอื่นใช้ JSON
app.use(express.json());
// Stripe webhook ต้องใช้ raw body ที่ content-type: application/json
app.use('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Stripe Webhook
app.post('/api/stripe/webhook', async (req: any, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return res.status(400).send('Missing signature or webhook secret');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // TODO: อัปเดตสถานะคำสั่งซื้อใน DB ตาม paymentIntent.metadata.orderId (ถ้ามี)
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler error');
  }
});

// Payments - Create PromptPay PaymentIntent
app.post('/api/payments/create', async (req, res) => {
  try {
    const { amount, currency = 'thb', description = 'Order payment', email, name, phone } = req.body;
    console.log('[payments/create] body =', req.body);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'จำนวนเงินไม่ถูกต้อง' });
    }
    if (!email) {
      return res.status(400).json({ message: 'Missing required param: billing_details[email].' });
    }

    // 1) สร้าง PaymentMethod แบบ PromptPay พร้อม billing_details ก่อน
    const pm = await stripe.paymentMethods.create({
      type: 'promptpay',
      billing_details: { email, name, phone },
    });

    // 2) สร้างและยืนยัน PaymentIntent โดยแนบ payment_method ที่สร้างไว้
    const confirmed = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)),
      currency,
      description,
      payment_method_types: ['promptpay'],
      payment_method: pm.id,
      confirm: true,
    });

    // ข้อมูล QR จะอยู่ใน next_action.display_qr_code (ถ้ามี)
    const nextAction: any = confirmed.next_action;
    const qr = nextAction?.promptpay_display_qr_code || nextAction?.display_qr_code;
    const hostedUrl = qr?.hosted_voucher_url || qr?.hosted_instructions_url || nextAction?.hosted_voucher_url || nextAction?.hosted_instructions_url || null;

    res.json({
      clientSecret: confirmed.client_secret,
      paymentIntentId: confirmed.id,
      status: confirmed.status,
      nextAction: confirmed.next_action,
      promptpayQr: qr || null,
      hostedUrl,
    });
  } catch (error: any) {
    console.error('Error creating PromptPay intent:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างการชำระเงิน', error: error?.message });
  }
});

// Payments - Check PaymentIntent status
app.get('/api/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const pi = await stripe.paymentIntents.retrieve(id, { expand: ['charges'] });
    res.json({ id: pi.id, status: pi.status, charges: (pi as any).charges || null });
  } catch (error: any) {
    res.status(404).json({ message: 'ไม่พบการชำระเงินนี้', error: error?.message });
  }
});

// Stripe Checkout (Hosted)
app.post('/api/checkout/create', async (req, res) => {
  try {
    const { amount, email, successUrl, cancelUrl } = req.body || {};
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'จำนวนเงินไม่ถูกต้อง' });
    }

    const origin = req.headers.origin || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['promptpay'],
      currency: 'thb',
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: { name: 'คำสั่งซื้อจากตะกร้า' },
            unit_amount: Math.round(Number(amount)),
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/cart?payment=cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้าง Checkout', error: error?.message });
  }
});

// Get checkout session details (for receipt)
app.get('/api/checkout/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await stripe.checkout.sessions.retrieve(id, {
      expand: ['payment_intent', 'payment_intent.latest_charge']
    });
    res.json({
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    });
  } catch (error: any) {
    res.status(404).json({ message: 'ไม่พบ session', error: error?.message });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    
    // Search by name, model, or category
    if (search) {
      whereConditions.push('(name LIKE ? OR model LIKE ? OR category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Filter by category
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    // Filter by price range
    if (minPrice) {
      whereConditions.push('price >= ?');
      params.push(parseFloat(minPrice as string));
    }

    if (maxPrice) {
      whereConditions.push('price <= ?');
      params.push(parseFloat(maxPrice as string));
    }

    let orderByClause = '';
    if (sort) {
      switch (sort) {
        case 'price-asc':
          orderByClause = 'ORDER BY price ASC';
          break;
        case 'price-desc':
          orderByClause = 'ORDER BY price DESC';
          break;
        case 'name-asc':
          orderByClause = 'ORDER BY name ASC';
          break;
        case 'rating-desc':
          orderByClause = 'ORDER BY rating DESC';
          break;
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const query = `SELECT * FROM products ${whereClause} ${orderByClause}`;
    
    const [products] = await pool.execute(query, params);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
});

app.get('/api/products/bestsellers', async (req, res) => {
  try {
    const [bestSellers] = await pool.execute(
      'SELECT * FROM products WHERE isBestSeller = 1 LIMIT 4'
    );
    res.json(bestSellers);
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าขายดี' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [parseInt(req.params.id)]
    );

    if (!products || (products as any[]).length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    res.json((products as any[])[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM products'
    );
    
    res.json((categories as any[]).map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่' });
  }
});

// Cart Routes
app.get('/api/cart', async (req, res) => {
  try {
    const [cartItems] = await pool.execute(`
      SELECT 
        p.id, p.name, p.model, p.price, p.image,
        ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
    `);

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (!products || (products as any[]).length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.execute(
      'SELECT * FROM cart_items WHERE productId = ?',
      [productId]
    );

    if ((existingItems as any[]).length > 0) {
      // Update quantity
      const existingItem = (existingItems as any[])[0];
      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [existingItem.quantity + quantity, existingItem.id]
      );
    } else {
      // Add new item
      await pool.execute(
        'INSERT INTO cart_items (productId, quantity) VALUES (?, ?)',
        [productId, quantity]
      );
    }

    // Return updated cart
    const [cartItems] = await pool.execute(`
      SELECT 
        p.id, p.name, p.model, p.price, p.image,
        ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
    `);

    res.json(cartItems);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า' });
  }
});

app.put('/api/cart/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    const [cartItems] = await pool.execute(
      'SELECT * FROM cart_items WHERE productId = ?',
      [productId]
    );

    if (!cartItems || (cartItems as any[]).length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้าในตะกร้า' });
    }

    const cartItem = (cartItems as any[])[0];

    if (quantity <= 0) {
      // Remove item
      await pool.execute(
        'DELETE FROM cart_items WHERE id = ?',
        [cartItem.id]
      );
    } else {
      // Update quantity
      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [quantity, cartItem.id]
      );
    }

    // Return updated cart
    const [updatedCartItems] = await pool.execute(`
      SELECT 
        p.id, p.name, p.model, p.price, p.image,
        ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
    `);

    res.json(updatedCartItems);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตตะกร้าสินค้า' });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const [cartItems] = await pool.execute(
      'SELECT * FROM cart_items WHERE productId = ?',
      [productId]
    );

    if ((cartItems as any[]).length > 0) {
      const cartItem = (cartItems as any[])[0];
      await pool.execute(
        'DELETE FROM cart_items WHERE id = ?',
        [cartItem.id]
      );
    }

    // Return updated cart
    const [updatedCartItems] = await pool.execute(`
      SELECT 
        p.id, p.name, p.model, p.price, p.image,
        ci.quantity
      FROM cart_items ci
      JOIN products p ON ci.productId = p.id
    `);

    res.json(updatedCartItems);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    await pool.execute('DELETE FROM cart_items');
    res.json([]);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการล้างตะกร้าสินค้า' });
  }
});

// User Routes
app.get('/api/user', async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users LIMIT 1');
    res.json((users as any[])[0] || null);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});

app.put('/api/user', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    const [users] = await pool.execute('SELECT * FROM users LIMIT 1');
    
    if ((users as any[]).length > 0) {
      const user = (users as any[])[0];
      const [result] = await pool.execute(
        'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, email, phone, address, user.id]
      );
      res.json({ ...user, name, email, phone, address });
    } else {
      // Create new user if none exists
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)',
        [name, email, phone, address]
      );
      const [newUsers] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [(result as any).insertId]
      );
      res.json((newUsers as any[])[0]);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้' });
  }
});

// Order Routes
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT 
        o.*,
        u.name as userName,
        u.email as userEmail
      FROM orders o
      JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
    `);

    // Get order items for each order
    const ordersWithItems = await Promise.all((orders as any[]).map(async (order) => {
      const [orderItems] = await pool.execute(
        'SELECT * FROM order_items WHERE orderId = ?',
        [order.id]
      );
      return { ...order, orderItems };
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'ไม่มีสินค้าในตะกร้า' });
    }

    const total = items.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );

    const [users] = await pool.execute('SELECT * FROM users LIMIT 1');
    if (!users || (users as any[]).length === 0) {
      return res.status(400).json({ message: 'ไม่พบข้อมูลผู้ใช้' });
    }

    const user = (users as any[])[0];

    // Create order
    const [orderResult] = await pool.execute(
      'INSERT INTO orders (userId, total, shippingAddress) VALUES (?, ?, ?)',
      [user.id, total, shippingAddress]
    );

    const orderId = (orderResult as any).insertId;

    // Create order items
    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_items (orderId, productId, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.name, item.price, item.quantity]
      );
    }

    // Clear cart
    await pool.execute('DELETE FROM cart_items');

    // Get created order
    const [newOrders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    res.json((newOrders as any[])[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ' });
  }
});

app.put('/api/orders/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.orderId]
    );

    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.orderId]
    );
    
    res.json((orders as any[])[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตคำสั่งซื้อ' });
  }
});

// Promotion Routes
app.get('/api/promotions', async (req, res) => {
  try {
    const [promotions] = await pool.execute(
      'SELECT * FROM promotions WHERE validUntil >= NOW() ORDER BY createdAt DESC'
    );
    res.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรโมชั่น' });
  }
});

// Contact Routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    await pool.execute(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone, message]
    );
    
    res.json({ 
      message: 'ส่งข้อความเรียบร้อยแล้ว เราจะติดต่อกลับโดยเร็วที่สุด',
      success: true 
    });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งข้อความ' });
  }
});

// Search Routes
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const [searchResults] = await pool.execute(
      'SELECT * FROM products WHERE name LIKE ? OR model LIKE ? OR category LIKE ? LIMIT 10',
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหาสินค้า' });
  }
});

// ===== Auth (JWT) =====
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function ensureUserPasswordColumn() {
  try {
    const conn = await pool.getConnection();
    try {
      const [cols]: any = await conn.query(`SHOW COLUMNS FROM users LIKE 'password'`);
      if (!cols || (cols as any[]).length === 0) {
        await conn.query(`ALTER TABLE users ADD COLUMN password VARCHAR(191) NULL AFTER email`);
        console.log('✅ Added users.password column');
      }
    } finally {
      conn.release();
    }
  } catch (e: any) {
    console.warn('⚠️ Ensure password column:', e?.message);
  }
}
ensureUserPasswordColumn();

const signToken = (payload: object) => jwt.sign(payload as any, JWT_SECRET, { expiresIn: '7d' });

const authMiddleware = (req: any, res: any, next: any) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });

    const [dup]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if ((dup as any[]).length) return res.status(409).json({ message: 'อีเมลนี้มีผู้ใช้แล้ว' });

    const hash = await bcrypt.hash(password, 10);
    const [r]: any = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash]
    );
    const token = signToken({ id: r.insertId, email });
    res.json({ token, user: { id: r.insertId, name, email } });
  } catch (e) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'กรอกอีเมลและรหัสผ่าน' });

    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const u = (rows as any[])[0];
    if (!u || !u.password) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const token = signToken({ id: u.id, email: u.email });
    res.json({ token, user: { id: u.id, name: u.name, email: u.email } });
  } catch (e) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, name, email, phone, address, avatar FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    res.json((rows as any[])[0] || null);
  } catch (e) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'เกิดข้อผิดพลาดในระบบ',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'ไม่พบ API endpoint ที่ต้องการ' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 API Documentation:`);
  console.log(`   GET  /api/products - รายการสินค้าทั้งหมด`);
  console.log(`   GET  /api/products/bestsellers - สินค้าขายดี`);
  console.log(`   GET  /api/cart - ข้อมูลตะกร้าสินค้า`);
  console.log(`   POST /api/cart - เพิ่มสินค้าลงตะกร้า`);
  console.log(`   GET  /api/user - ข้อมูลผู้ใช้`);
  console.log(`   GET  /api/orders - ประวัติคำสั่งซื้อ`);
  console.log(`   GET  /api/promotions - โปรโมชั่น`);
  console.log(`   POST /api/contact - ส่งข้อความติดต่อ`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
}); 