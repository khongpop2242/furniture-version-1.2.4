import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';

console.log('🗄️ สร้างฐานข้อมูลและตาราง...');

async function setupDatabase() {
  try {
    // เชื่อมต่อ MySQL Server (ไม่ระบุฐานข้อมูล)
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('✅ เชื่อมต่อ MySQL Server สำเร็จ');

    // สร้างฐานข้อมูล
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ สร้างฐานข้อมูล "${dbConfig.database}" สำเร็จ`);

    // ใช้ฐานข้อมูล (ต้องใช้ query แทน execute เพื่อหลีกเลี่ยง prepared statement error)
    await connection.query(`USE \`${dbConfig.database}\``);

    // สร้างตาราง users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        avatar VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง users สำเร็จ');

    // สร้างตาราง products
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        model VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        originalPrice DECIMAL(10,2) NOT NULL,
        image VARCHAR(500) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        stock INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        reviews INT DEFAULT 0,
        isBestSeller BOOLEAN DEFAULT FALSE,
        isOnSale BOOLEAN DEFAULT FALSE,
        discount INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง products สำเร็จ');

    // สร้างตาราง cart_items
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId INT NOT NULL,
        quantity INT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง cart_items สำเร็จ');

    // สร้างตาราง orders
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        userId INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
        shippingAddress TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง orders สำเร็จ');

    // สร้างตาราง order_items
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId VARCHAR(255) NOT NULL,
        productId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง order_items สำเร็จ');

    // สร้างตาราง promotions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discount INT NOT NULL,
        validUntil TIMESTAMP NOT NULL,
        image VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง promotions สำเร็จ');

    // สร้างตาราง contacts
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        message TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ สร้างตาราง contacts สำเร็จ');

    await connection.end();
    console.log('\n🎉 สร้างฐานข้อมูลและตารางเสร็จสิ้น!');
    console.log('💡 รัน "npm run db:seed-all" เพื่อเพิ่มข้อมูลตัวอย่าง');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
}

setupDatabase(); 