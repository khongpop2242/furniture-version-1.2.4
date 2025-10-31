import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';

console.log('🌱 เพิ่มข้อมูลตัวอย่างทั้งหมด...');

async function seedData() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

    // ลบข้อมูลเก่า
    await connection.execute('DELETE FROM cart_items');
    await connection.execute('DELETE FROM order_items');
    await connection.execute('DELETE FROM orders');
    await connection.execute('DELETE FROM users');
    await connection.execute('DELETE FROM promotions');
    await connection.execute('DELETE FROM contacts');
    console.log('🧹 ลบข้อมูลเก่าแล้ว');

    // เพิ่มข้อมูลผู้ใช้
    await connection.execute(`
      INSERT INTO users (name, email, phone, address) VALUES 
      ('สมชาย ใจดี', 'somchai@example.com', '0812345678', '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'),
      ('สมหญิง รักดี', 'somying@example.com', '0898765432', '456 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400')
    `);
    console.log('✅ เพิ่มข้อมูลผู้ใช้สำเร็จ');

    // เพิ่มข้อมูลโปรโมชั่น
    await connection.execute(`
      INSERT INTO promotions (title, description, discount, validUntil, image, category) VALUES 
      ('ลดพิเศษ 20% เก้าอี้ทั้งหมด', 'ลดพิเศษ 20% สำหรับเก้าอี้ทุกประเภท หมดเขต 31 ธันวาคม 2024', 20, '2024-12-31 23:59:59', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 'เก้าอี้'),
      ('โปรโมชั่นโต๊ะทำงาน', 'ซื้อโต๊ะทำงาน รับส่วนลด 15% พร้อมเก้าอี้ฟรี', 15, '2024-11-30 23:59:59', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', 'โต๊ะทำงาน'),
      ('ลดราคาตู้เก็บเอกสาร', 'ลดราคาตู้เก็บเอกสารทุกขนาด 10-25%', 25, '2024-10-31 23:59:59', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'ตู้เก็บเอกสาร')
    `);
    console.log('✅ เพิ่มข้อมูลโปรโมชั่นสำเร็จ');

    // เพิ่มข้อมูลตะกร้าสินค้า
    await connection.execute(`
      INSERT INTO cart_items (productId, quantity) VALUES 
      (1, 2),
      (3, 1),
      (5, 1)
    `);
    console.log('✅ เพิ่มข้อมูลตะกร้าสินค้าสำเร็จ');

    // เพิ่มข้อมูลคำสั่งซื้อ
    const orderId = 'ORD-' + Date.now();
    await connection.execute(`
      INSERT INTO orders (id, userId, total, status, shippingAddress) VALUES 
      (?, 1, 15600.00, 'CONFIRMED', '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110')
    `, [orderId]);

    await connection.execute(`
      INSERT INTO order_items (orderId, productId, name, price, quantity) VALUES 
      (?, 1, 'เก้าอี้ทำงาน Ergonomic', 4500.00, 2),
      (?, 2, 'โต๊ะทำงานไม้สวย', 8900.00, 1)
    `, [orderId, orderId]);
    console.log('✅ เพิ่มข้อมูลคำสั่งซื้อสำเร็จ');

    // เพิ่มข้อมูลติดต่อ
    await connection.execute(`
      INSERT INTO contacts (name, email, phone, message) VALUES 
      ('ลูกค้าทั่วไป', 'customer@example.com', '0812345678', 'ต้องการสอบถามข้อมูลสินค้าเก้าอี้ทำงาน'),
      ('บริษัท ABC', 'abc@company.com', '021234567', 'ต้องการขอใบเสนอราคาสำหรับเฟอร์นิเจอร์สำนักงาน')
    `);
    console.log('✅ เพิ่มข้อมูลติดต่อสำเร็จ');

    // ตรวจสอบข้อมูล
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [promoCount] = await connection.execute('SELECT COUNT(*) as count FROM promotions');
    const [cartCount] = await connection.execute('SELECT COUNT(*) as count FROM cart_items');
    const [orderCount] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    const [contactCount] = await connection.execute('SELECT COUNT(*) as count FROM contacts');

    console.log('\n📊 สรุปข้อมูลที่เพิ่ม:');
    console.log(`   ผู้ใช้: ${userCount[0].count} คน`);
    console.log(`   โปรโมชั่น: ${promoCount[0].count} รายการ`);
    console.log(`   ตะกร้าสินค้า: ${cartCount[0].count} รายการ`);
    console.log(`   คำสั่งซื้อ: ${orderCount[0].count} รายการ`);
    console.log(`   ข้อความติดต่อ: ${contactCount[0].count} รายการ`);

    await connection.end();
    console.log('\n🎉 เพิ่มข้อมูลตัวอย่างเสร็จสิ้น!');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
}

seedData(); 