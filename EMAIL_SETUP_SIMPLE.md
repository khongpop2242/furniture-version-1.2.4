# คู่มือการตั้งค่า Email แบบง่าย

## ภาพรวม
ใช้ฟังก์ชันที่มีอยู่แล้วในโปรเจค โดยไม่ต้องเพิ่ม script อื่นๆ

## การตั้งค่า

### 1. เปิดไฟล์ `.env` ในโฟลเดอร์ `backend/`

### 2. เพิ่มการตั้งค่า Email:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## การตั้งค่าสำหรับ Gmail

### 1. เปิดใช้งาน 2-Factor Authentication
1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
2. เปิดใช้งาน 2-Step Verification

### 2. สร้าง App Password
1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
2. คลิก "App passwords" ภายใต้ "2-Step Verification"
3. เลือก "Mail" และ "Other (Custom name)"
4. ใส่ชื่อ "Furniture App"
5. คัดลอกรหัสผ่าน 16 ตัวอักษรที่ได้

### 3. ตั้งค่าใน .env
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## การใช้งาน

### 1. เริ่ม Server
```bash
cd backend
npm start
```

### 2. ทดสอบ Forgot Password
1. เปิด http://localhost:3000
2. ไปที่หน้า Login
3. คลิก "ลืมรหัสผ่าน?"
4. กรอกอีเมล
5. ตรวจสอบ inbox ของอีเมล

## ตัวอย่างไฟล์ .env ที่สมบูรณ์

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=furniture_office
DATABASE_URL=mysql://root:12345678@localhost:3306/furniture_office

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration สำหรับ Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Server Configuration
PORT=5000
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## หมายเหตุ

- ใช้ฟังก์ชันที่มีอยู่แล้วในโปรเจค
- ไม่ต้องเพิ่ม script อื่นๆ
- ใช้ TypeScript และ Prisma ที่มีอยู่แล้ว
- App Password จะมี 16 ตัวอักษรและไม่มีช่องว่าง
- ตรวจสอบ Spam folder หากไม่ได้รับ email
