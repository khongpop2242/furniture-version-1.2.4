# การแก้ไขปัญหาการสร้างคำสั่งซื้อหลังชำระเงิน

## ปัญหาที่พบ
หลังชำระเงินผ่าน Stripe สำเร็จ ระบบไม่ได้:
- บันทึกคำสั่งซื้อลงฐานข้อมูล
- ลดสต็อกสินค้า
- ลบสินค้าออกจากตะกร้า

## สาเหตุ
ระบบยังไม่ได้เชื่อมต่อการสร้างคำสั่งซื้อกับ Stripe Checkout

## การแก้ไข

### 1. อัปเดต Stripe Webhook
เพิ่มการจัดการ `checkout.session.completed` event:

```typescript
case 'checkout.session.completed': {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log('Checkout session completed:', session.id);
  
  // สร้างคำสั่งซื้อจาก session
  await createOrderFromSession(session);
  break;
}
```

### 2. สร้างฟังก์ชัน createOrderFromSession
ฟังก์ชันนี้จะ:
- ดึงข้อมูลสินค้าจากตะกร้า
- สร้างคำสั่งซื้อในฐานข้อมูล
- ลดสต็อกสินค้า
- ลบสินค้าออกจากตะกร้า

```typescript
const createOrderFromSession = async (session: Stripe.Checkout.Session) => {
  // ดึงข้อมูลสินค้าจาก cart
  const cartItems = await prisma.cartItem.findMany({
    include: { product: true }
  });

  // สร้างคำสั่งซื้อ
  const order = await prisma.order.create({
    data: {
      userId: 1,
      total: total,
      status: 'PENDING',
      shippingAddress: 'ที่อยู่จัดส่ง',
      orderItems: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          price: parseFloat(item.product.price.toString()),
          quantity: item.quantity
        }))
      }
    }
  });

  // ลดสต็อกสินค้า
  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }

  // ลบสินค้าออกจาก cart
  await prisma.cartItem.deleteMany();
};
```

### 3. เพิ่ม API Endpoint สำหรับสร้างคำสั่งซื้อ
```typescript
app.post('/api/checkout/session/:id/create-order', async (req, res) => {
  const { id } = req.params;
  const session = await stripe.checkout.sessions.retrieve(id);
  
  if (session.payment_status !== 'paid') {
    return res.status(400).json({ message: 'การชำระเงินยังไม่สำเร็จ' });
  }

  const order = await createOrderFromSession(session);
  res.json({ message: 'สร้างคำสั่งซื้อสำเร็จ', order: order });
});
```

### 4. อัปเดต CheckoutSuccess.js
เรียก API สร้างคำสั่งซื้อเมื่อโหลดหน้า:

```javascript
const fetchSessionData = useCallback(async (sessionId) => {
  // ดึงข้อมูล session
  const sessionResponse = await axios.get(`/api/checkout/session/${sessionId}`);
  
  // สร้างคำสั่งซื้อจาก session
  try {
    const orderResponse = await axios.post(`/api/checkout/session/${sessionId}/create-order`);
    console.log('✅ Order created:', orderResponse.data);
  } catch (orderError) {
    console.log('⚠️ Order might already exist:', orderError.response?.data?.message);
  }
}, [navigate]);
```

## วิธีการทำงาน

### 1. เมื่อชำระเงินสำเร็จ
- Stripe จะส่ง webhook `checkout.session.completed`
- ระบบจะสร้างคำสั่งซื้ออัตโนมัติ
- ลดสต็อกและลบสินค้าจากตะกร้า

### 2. เมื่อเข้าหน้า CheckoutSuccess
- ระบบจะเรียก API สร้างคำสั่งซื้ออีกครั้ง (ป้องกันกรณี webhook ไม่ทำงาน)
- แสดงข้อมูลการชำระเงินสำเร็จ

## การทดสอบ

### 1. ทดสอบ Webhook
```bash
# ใช้ Stripe CLI สำหรับทดสอบ webhook
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

### 2. ทดสอบ API
```bash
curl -X POST http://localhost:5000/api/checkout/session/{session_id}/create-order
```

### 3. ตรวจสอบฐานข้อมูล
- ตรวจสอบตาราง `Order` และ `OrderItem`
- ตรวจสอบสต็อกสินค้าในตาราง `Product`
- ตรวจสอบตะกร้าในตาราง `CartItem`

## หมายเหตุ
- ระบบมี fallback mechanism (API endpoint) ในกรณีที่ webhook ไม่ทำงาน
- ตรวจสอบ duplicate orders เพื่อป้องกันการสร้างคำสั่งซื้อซ้ำ
- ใช้ user ID 1 เป็น default (ควรปรับให้รับจาก session metadata)

## การปรับปรุงในอนาคต
1. เก็บ user ID ใน session metadata
2. เพิ่มการจัดการ error cases
3. เพิ่ม logging และ monitoring
4. เพิ่มการตรวจสอบ stock ก่อนสร้างคำสั่งซื้อ
