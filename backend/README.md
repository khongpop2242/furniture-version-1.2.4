# Backend API - เฟอร์นิเจอร์ออฟฟิศ

Backend API สำหรับเว็บไซต์เฟอร์นิเจอร์ออฟฟิศ สร้างด้วย React, TypeScript, Express.js, Prisma และ MySQL

## 🚀 การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
cd backend
npm install
```

### 2. ตั้งค่าฐานข้อมูล MySQL
1. ติดตั้ง MySQL Server
2. สร้างฐานข้อมูล `furniture_office`
3. สร้างไฟล์ `.env` และกำหนดค่า DATABASE_URL:
```env
DATABASE_URL="mysql://username:password@localhost:3306/furniture_office"
PORT=5000
NODE_ENV=development
```

### 3. สร้างและ migrate ฐานข้อมูล
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# หรือใช้ migration (แนะนำสำหรับ production)
npm run db:migrate
```

### 4. เพิ่มข้อมูลตัวอย่าง
```bash
npm run db:seed
```

### 5. รันเซิร์ฟเวอร์
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:5000`

## 📊 API Endpoints

### สินค้า (Products)
- `GET /api/products` - รายการสินค้าทั้งหมด
- `GET /api/products/bestsellers` - สินค้าขายดี
- `GET /api/products/:id` - ข้อมูลสินค้าเฉพาะ
- `GET /api/categories` - รายการหมวดหมู่สินค้า

**Query Parameters สำหรับ /api/products:**
- `search` - ค้นหาสินค้า
- `category` - กรองตามหมวดหมู่
- `minPrice` - ราคาขั้นต่ำ
- `maxPrice` - ราคาสูงสุด
- `sort` - เรียงลำดับ (price-asc, price-desc, name-asc, rating-desc)

### ตะกร้าสินค้า (Cart)
- `GET /api/cart` - ข้อมูลตะกร้าสินค้า
- `POST /api/cart` - เพิ่มสินค้าลงตะกร้า
- `PUT /api/cart/:productId` - อัปเดตจำนวนสินค้า
- `DELETE /api/cart/:productId` - ลบสินค้าออกจากตะกร้า
- `DELETE /api/cart` - ล้างตะกร้าสินค้า

### ผู้ใช้ (User)
- `GET /api/user` - ข้อมูลผู้ใช้
- `PUT /api/user` - อัปเดตข้อมูลผู้ใช้

### คำสั่งซื้อ (Orders)
- `GET /api/orders` - ประวัติคำสั่งซื้อ
- `POST /api/orders` - สร้างคำสั่งซื้อใหม่
- `PUT /api/orders/:orderId` - อัปเดตสถานะคำสั่งซื้อ

### โปรโมชั่น (Promotions)
- `GET /api/promotions` - รายการโปรโมชั่น

### ติดต่อ (Contact)
- `POST /api/contact` - ส่งข้อความติดต่อ

### ค้นหา (Search)
- `GET /api/search?q=keyword` - ค้นหาสินค้า

### สถานะระบบ (Health)
- `GET /api/health` - ตรวจสอบสถานะระบบ

## 🗄️ โครงสร้างฐานข้อมูล

### User
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  avatar VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Product
```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
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
);
```

### CartItem
```sql
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productId INT NOT NULL,
  quantity INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

### Order
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  userId INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  shippingAddress TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### OrderItem
```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL,
  productId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

### Promotion
```sql
CREATE TABLE promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  discount INT NOT NULL,
  validUntil TIMESTAMP NOT NULL,
  image VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Contact
```sql
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  message TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 ตัวอย่างการใช้งาน

### เพิ่มสินค้าลงตะกร้า
```javascript
fetch('http://localhost:5000/api/cart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 1,
    quantity: 2
  })
});
```

### ค้นหาสินค้า
```javascript
fetch('http://localhost:5000/api/products?search=ตู้&category=ตู้เก็บเอกสาร&sort=price-asc');
```

### สร้างคำสั่งซื้อ
```javascript
fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      {
        productId: 1,
        name: "ตู้เหล็ก 18 ช่องโล่ง",
        price: 5000.00,
        quantity: 1
      }
    ],
    shippingAddress: "123 ถนนสุขุมวิท กรุงเทพฯ"
  })
});
```

## 🔧 การพัฒนา

### Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ backend:
```env
DATABASE_URL="mysql://username:password@localhost:3306/furniture_office"
PORT=5000
NODE_ENV=development
```

### การเพิ่ม API Endpoint ใหม่
1. เพิ่ม route ใน `server.ts`
2. เพิ่ม model ใน `prisma/schema.prisma` (ถ้าจำเป็น)
3. รัน `npm run db:push` เพื่ออัปเดตฐานข้อมูล
4. ทดสอบ API

### การจัดการฐานข้อมูล
```bash
# ดูข้อมูลในฐานข้อมูล
npm run db:studio

# สร้าง migration ใหม่
npm run db:migrate

# เพิ่มข้อมูลตัวอย่าง
npm run db:seed
```

## 🚀 การ Deploy

### Heroku
```bash
# สร้างไฟล์ Procfile
echo "web: npm start" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Vercel
สร้างไฟล์ `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.ts"
    }
  ]
}
```

## 📊 การทดสอบ API

### ใช้ curl
```bash
# ทดสอบ health check
curl http://localhost:5000/api/health

# ดึงข้อมูลสินค้า
curl http://localhost:5000/api/products

# เพิ่มสินค้าลงตะกร้า
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

### ใช้ Postman
1. Import collection จากไฟล์ JSON
2. ทดสอบ endpoints ต่างๆ
3. ตรวจสอบ response และ status codes

## 🛠️ เทคโนโลยีที่ใช้

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Development**: React (Create React App)

## 📞 การสนับสนุน

หากมีปัญหาหรือคำถาม กรุณาติดต่อทีมพัฒนา
