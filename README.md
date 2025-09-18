# 🪑 Furniture Office - เว็บไซต์เฟอร์นิเจอร์ออฟฟิศ

เว็บไซต์ E-commerce สำหรับเฟอร์นิเจอร์ออฟฟิศที่สร้างด้วย React และ Node.js พร้อมระบบฐานข้อมูล MySQL

## ✨ คุณสมบัติ

- 🏠 **หน้าแรก** - แสดงสินค้าแนะนำและโปรโมชั่น
- 🛍️ **หน้าสินค้า** - รายการสินค้าพร้อมระบบค้นหาและกรอง
- 🛒 **ตะกร้าสินค้า** - จัดการสินค้าในตะกร้า พร้อมฟีเจอร์พิมพ์ใบเสนอราคา
- 👤 **โปรไฟล์** - จัดการข้อมูลส่วนตัว
- 📋 **ประวัติคำสั่งซื้อ** - ดูสถานะและประวัติการสั่งซื้อ
- 🎉 **โปรโมชั่น** - ดูโปรโมชั่นและส่วนลดต่างๆ
- 📞 **ติดต่อเรา** - ส่งข้อความติดต่อ
- ℹ️ **เกี่ยวกับเรา** - ข้อมูลบริษัท

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Framework
- **React Router DOM** - Client-side Routing
- **Axios** - HTTP Client
- **CSS3** - Styling
- **Font Awesome** - Icons

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **MySQL Database** - ฐานข้อมูลหลัก
- **mysql2/promise** - MySQL Driver

### Development Tools
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple commands
- **ts-node** - TypeScript execution

## 📦 การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd furnituree
```

### 2. ตั้งค่าฐานข้อมูล MySQL

#### ติดตั้ง MySQL Server:
- **Windows**: ดาวน์โหลดจาก [mysql.com](https://dev.mysql.com/downloads/installer/)
- **macOS**: `brew install mysql && brew services start mysql`
- **Linux**: `sudo apt install mysql-server`

#### สร้างไฟล์ .env:
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend` โดยคัดลอกจาก `env.example`:

```bash
cd backend
copy env.example .env
```

แก้ไขไฟล์ `.env`:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/furniture_office"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=furniture_office
PORT=5000
NODE_ENV=development
```

**หมายเหตุ:** แทนที่ `your_password` ด้วยรหัสผ่าน MySQL ของคุณ

### 3. ติดตั้ง Dependencies
```bash
# ติดตั้ง dependencies ทั้งหมด
npm run install-all

# หรือติดตั้งแยก
npm install
cd frontend && npm install
cd backend && npm install
```

### 4. สร้างและ migrate ฐานข้อมูล
```bash
cd backend

# ทดสอบการเชื่อมต่อ
npm run db:test

# สร้างฐานข้อมูลและตาราง
npm run db:setup

# เพิ่มข้อมูลตัวอย่าง
npm run db:seed-all

# หรือรีเซ็ตทั้งหมดพร้อมกัน
npm run db:reset

cd ..
```

### 5. รันโปรเจค
```bash
# รันทั้ง frontend และ backend พร้อมกัน
npm run dev

# หรือรันแยก
npm run server  # Backend only
npm run client  # Frontend only
```

## 🚀 การใช้งาน

### Frontend (React)
- **URL**: http://localhost:3000
- **Features**: 
  - หน้าแรกแสดงสินค้าแนะนำ
  - ระบบค้นหาและกรองสินค้า
  - ตะกร้าสินค้าพร้อมพิมพ์ใบเสนอราคา
  - ระบบจัดการโปรไฟล์

### Backend (Node.js/Express)
- **URL**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/health

#### API Endpoints:
- `GET /api/products` - รายการสินค้าทั้งหมด
- `GET /api/products/bestsellers` - สินค้าขายดี
- `GET /api/products/:id` - ข้อมูลสินค้าเฉพาะ
- `GET /api/categories` - รายการหมวดหมู่
- `GET /api/cart` - ข้อมูลตะกร้าสินค้า
- `POST /api/cart` - เพิ่มสินค้าลงตะกร้า
- `PUT /api/cart/:productId` - อัปเดตจำนวนสินค้า
- `DELETE /api/cart/:productId` - ลบสินค้าออกจากตะกร้า
- `GET /api/user` - ข้อมูลผู้ใช้
- `PUT /api/user` - อัปเดตข้อมูลผู้ใช้
- `GET /api/orders` - ประวัติคำสั่งซื้อ
- `POST /api/orders` - สร้างคำสั่งซื้อใหม่
- `GET /api/promotions` - โปรโมชั่น
- `POST /api/contact` - ส่งข้อความติดต่อ
- `GET /api/search` - ค้นหาสินค้า

## 📁 โครงสร้างโปรเจค

```
furnituree/
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React Components
│   │   ├── pages/          # Page Components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/                  # Node.js Backend
│   ├── config/
│   │   └── database.js      # Database configuration
│   ├── scripts/
│   │   ├── setup-database.js    # Database setup
│   │   ├── seed-products.js     # Product seeding
│   │   ├── seed-data.js         # All data seeding
│   │   ├── test-connection.js   # Connection test
│   │   └── quick-setup.js       # Quick setup
│   ├── prisma/
│   │   └── schema.prisma    # Database schema (for reference)
│   ├── server.ts            # Express server
│   ├── package.json
│   └── env.example
├── package.json
└── README.md
```

## 🗄️ ฐานข้อมูล

### ตารางหลัก:
- **users** - ข้อมูลผู้ใช้
- **products** - ข้อมูลสินค้า
- **cart_items** - สินค้าในตะกร้า
- **orders** - คำสั่งซื้อ
- **order_items** - รายการสินค้าในคำสั่งซื้อ
- **promotions** - โปรโมชั่น
- **contacts** - ข้อความติดต่อ

### การจัดการฐานข้อมูล:
```bash
cd backend

# ทดสอบการเชื่อมต่อ
npm run db:test

# สร้างฐานข้อมูลและตาราง
npm run db:setup

# เพิ่มข้อมูลตัวอย่าง
npm run db:seed-all

# รีเซ็ตฐานข้อมูลทั้งหมด
npm run db:reset

# Quick setup (ทดสอบ + สร้าง + เพิ่มข้อมูล)
npm run db:quick-setup
```

## 🔧 การพัฒนา

### Scripts ที่มีประโยชน์:
```bash
# Root level
npm run dev              # รันทั้ง frontend และ backend
npm run install-all      # ติดตั้ง dependencies ทั้งหมด
npm run db:setup         # สร้างฐานข้อมูล
npm run db:seed          # เพิ่มข้อมูลตัวอย่าง
npm run db:reset         # รีเซ็ตฐานข้อมูล

# Backend only
cd backend
npm run dev              # รัน server ในโหมด development
npm run build            # Build TypeScript
npm run db:test          # ทดสอบการเชื่อมต่อฐานข้อมูล
```

### การแก้ไขปัญหา:

#### ปัญหาการเชื่อมต่อฐานข้อมูล:
1. ตรวจสอบว่า MySQL Server กำลังทำงาน
2. ตรวจสอบไฟล์ `.env` ว่าการตั้งค่าถูกต้อง
3. รัน `npm run db:test` เพื่อทดสอบการเชื่อมต่อ

#### ปัญหา Port ถูกใช้งาน:
- เปลี่ยน PORT ในไฟล์ `.env`
- หรือปิดโปรแกรมที่ใช้ port นั้น

## 📝 หมายเหตุ

- โปรเจคนี้ใช้ MySQL เป็นฐานข้อมูลหลัก
- ใช้ `mysql2/promise` สำหรับการเชื่อมต่อฐานข้อมูล
- มีระบบ seeding ข้อมูลตัวอย่างสำหรับการทดสอบ
- รองรับการพิมพ์ใบเสนอราคาจากตะกร้าสินค้า

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE) 