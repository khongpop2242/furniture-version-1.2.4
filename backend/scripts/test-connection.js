import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';

console.log('🔍 ทดสอบการเชื่อมต่อฐานข้อมูล MySQL...');
console.log('📊 การตั้งค่า:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);

async function testConnection() {
  try {
    // ทดสอบการเชื่อมต่อ
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('✅ เชื่อมต่อ MySQL Server สำเร็จ!');

    // ตรวจสอบว่าฐานข้อมูลมีอยู่หรือไม่
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbConfig.database);

    if (dbExists) {
      console.log(`✅ พบฐานข้อมูล "${dbConfig.database}"`);
      
      // ใช้ฐานข้อมูล
      await connection.execute(`USE ${dbConfig.database}`);
      
      // ตรวจสอบตาราง
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📋 พบตาราง ${tables.length} ตาราง:`);
      
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   - ${tableName}: ${count[0].count} รายการ`);
      }
    } else {
      console.log(`❌ ไม่พบฐานข้อมูล "${dbConfig.database}"`);
      console.log('💡 วิธีแก้ไข: รัน "npm run db:setup" เพื่อสร้างฐานข้อมูล');
    }

    await connection.end();
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:', error.message);
    console.log('');
    console.log('💡 วิธีแก้ไข:');
    console.log('   1. ตรวจสอบ username และ password');
    console.log('   2. ตรวจสอบไฟล์ .env');
    console.log('   3. ตรวจสอบสิทธิ์การเข้าถึง MySQL');
    console.log('   4. ตรวจสอบว่า MySQL Server กำลังทำงาน');
  }
}

testConnection(); 