import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';

console.log('🌱 เพิ่มข้อมูลสินค้าตัวอย่าง...');

const products = [
  {
    name: 'เก้าอี้ทำงาน Ergonomic',
    model: 'ERG-001',
    price: 4500.00,
    originalPrice: 5500.00,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    category: 'เก้าอี้',
    description: 'เก้าอี้ทำงานแบบ Ergonomic ที่ออกแบบมาเพื่อสุขภาพที่ดี มีการรองรับหลังและแขนที่ปรับได้',
    stock: 15,
    rating: 4.8,
    reviews: 127,
    isBestSeller: true,
    isOnSale: true,
    discount: 18
  },
  {
    name: 'โต๊ะทำงานไม้สวย',
    model: 'DESK-002',
    price: 8900.00,
    originalPrice: 8900.00,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    category: 'โต๊ะทำงาน',
    description: 'โต๊ะทำงานไม้สวย ดีไซน์เรียบง่าย เหมาะสำหรับการทำงานที่บ้าน',
    stock: 8,
    rating: 4.6,
    reviews: 89,
    isBestSeller: false,
    isOnSale: false,
    discount: 0
  },
  {
    name: 'ตู้เก็บเอกสาร 5 ลิ้นชัก',
    model: 'CAB-003',
    price: 3200.00,
    originalPrice: 3800.00,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'ตู้เก็บเอกสาร',
    description: 'ตู้เก็บเอกสาร 5 ลิ้นชัก วัสดุคุณภาพดี เก็บของได้เยอะ',
    stock: 22,
    rating: 4.4,
    reviews: 156,
    isBestSeller: true,
    isOnSale: true,
    discount: 16
  },
  {
    name: 'โคมไฟตั้งโต๊ะ LED',
    model: 'LAMP-004',
    price: 1200.00,
    originalPrice: 1500.00,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'โคมไฟ',
    description: 'โคมไฟตั้งโต๊ะ LED แบบปรับความสว่างได้ ดีไซน์ทันสมัย',
    stock: 35,
    rating: 4.7,
    reviews: 203,
    isBestSeller: false,
    isOnSale: true,
    discount: 20
  },
  {
    name: 'เก้าอี้รับแขกหนังเทียม',
    model: 'CHAIR-005',
    price: 2800.00,
    originalPrice: 3200.00,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400',
    category: 'เก้าอี้',
    description: 'เก้าอี้รับแขกหนังเทียม นั่งสบาย เหมาะสำหรับห้องรับแขก',
    stock: 12,
    rating: 4.3,
    reviews: 67,
    isBestSeller: false,
    isOnSale: true,
    discount: 13
  },
  {
    name: 'โต๊ะประชุม 6 ที่นั่ง',
    model: 'TABLE-006',
    price: 15000.00,
    originalPrice: 18000.00,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
    category: 'โต๊ะประชุม',
    description: 'โต๊ะประชุมขนาด 6 ที่นั่ง วัสดุไม้คุณภาพสูง เหมาะสำหรับห้องประชุม',
    stock: 5,
    rating: 4.9,
    reviews: 34,
    isBestSeller: true,
    isOnSale: true,
    discount: 17
  },
  {
    name: 'ชั้นวางหนังสือ 5 ชั้น',
    model: 'SHELF-007',
    price: 2100.00,
    originalPrice: 2100.00,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    category: 'ชั้นวางหนังสือ',
    description: 'ชั้นวางหนังสือ 5 ชั้น ดีไซน์เรียบง่าย เก็บหนังสือได้เยอะ',
    stock: 18,
    rating: 4.5,
    reviews: 92,
    isBestSeller: false,
    isOnSale: false,
    discount: 0
  },
  {
    name: 'เก้าอี้หมุนสำนักงาน',
    model: 'SWIVEL-008',
    price: 3800.00,
    originalPrice: 4500.00,
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    category: 'เก้าอี้',
    description: 'เก้าอี้หมุนสำนักงาน มีล้อเลื่อน ปรับความสูงได้ นั่งสบาย',
    stock: 25,
    rating: 4.6,
    reviews: 178,
    isBestSeller: true,
    isOnSale: true,
    discount: 16
  }
];

async function seedProducts() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ลบข้อมูลเก่า
    await connection.execute('DELETE FROM cart_items');
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM orders');
    await connection.execute('DELETE FROM products');
    console.log('🧹 ลบข้อมูลสินค้าเก่าแล้ว');

    // เพิ่มข้อมูลสินค้าใหม่
    for (const product of products) {
      await connection.execute(`
        INSERT INTO products (name, model, price, originalPrice, image, category, description, stock, rating, reviews, isBestSeller, isOnSale, discount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.name, product.model, product.price, product.originalPrice, 
        product.image, product.category, product.description, product.stock,
        product.rating, product.reviews, product.isBestSeller, product.isOnSale, product.discount
      ]);
    }

    console.log(`✅ เพิ่มข้อมูลสินค้า ${products.length} รายการสำเร็จ`);

    // ตรวจสอบข้อมูล
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM products');
    console.log(`📊 จำนวนสินค้าในฐานข้อมูล: ${result[0].count} รายการ`);

    await connection.end();
    console.log('🎉 เพิ่มข้อมูลสินค้าตัวอย่างเสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
}

seedProducts(); 