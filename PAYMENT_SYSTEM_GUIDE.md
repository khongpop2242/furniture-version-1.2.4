# ระบบการชำระเงินแบบจำลอง Stripe Payment

## ภาพรวม
ระบบการชำระเงินนี้ใช้ Stripe API แบบจำลองสำหรับการทดสอบ โดยรองรับการชำระเงินผ่าน PromptPay QR Code

## ฟีเจอร์ที่รองรับ

### 1. การสร้างการชำระเงิน
- สร้าง PaymentIntent ผ่าน Stripe API
- รองรับ PromptPay QR Code
- ตรวจสอบสถานะการชำระเงินแบบ Real-time

### 2. หน้าจอการชำระเงิน
- แสดงข้อมูลคำสั่งซื้อ
- แสดง QR Code สำหรับการชำระเงิน
- ตรวจสอบสถานะการชำระเงินอัตโนมัติ
- ปุ่มจำลองการชำระเงิน (สำหรับการทดสอบ)

### 3. หน้าผลลัพธ์การชำระเงิน
- แสดงข้อมูลการชำระเงินสำเร็จ
- แสดงรายละเอียดคำสั่งซื้อ
- ปุ่มนำทางไปยังหน้าอื่น

## การใช้งาน

### 1. เริ่มต้นการชำระเงิน
1. ไปที่หน้า Cart
2. คลิก "ชำระเงิน"
3. กรอกข้อมูลการจัดส่งและใบกำกับภาษี
4. คลิก "ชำระเงิน" ในหน้า Payment

### 2. การชำระเงินจริง
- ระบบจะสร้าง QR Code สำหรับการชำระเงิน
- เปิดแอปธนาคารและสแกน QR Code
- ระบบจะตรวจสอบสถานะการชำระเงินอัตโนมัติ

### 3. การทดสอบ (จำลองการชำระเงิน)
- คลิกปุ่ม "จำลองการชำระเงิน" สีเขียว
- ระบบจะจำลองการชำระเงินสำเร็จ
- นำไปยังหน้าผลลัพธ์ทันที

## API Endpoints

### Backend API
```
POST /api/payments/create
- สร้างการชำระเงินใหม่
- รับ: amount, currency, description, email, name, phone
- ส่งคืน: paymentIntentId, hostedUrl, status

GET /api/payments/:id/status
- ตรวจสอบสถานะการชำระเงิน
- ส่งคืน: status, charges

POST /api/stripe/webhook
- รับ webhook จาก Stripe
- จัดการ payment_intent.succeeded
```

### Frontend Routes
```
/payment - หน้าชำระเงิน
/checkout/success - หน้าผลลัพธ์การชำระเงิน
```

## การตั้งค่า Environment Variables

### Backend (.env)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend
- API Base URL: http://localhost:5000
- Stripe Publishable Key: pk_test_...

## การทดสอบ

### 1. ทดสอบการสร้างการชำระเงิน
```bash
curl -X POST http://localhost:5000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "currency": "thb",
    "description": "Test Payment",
    "email": "test@example.com",
    "name": "Test User",
    "phone": "0812345678"
  }'
```

### 2. ทดสอบการตรวจสอบสถานะ
```bash
curl http://localhost:5000/api/payments/{payment_intent_id}/status
```

## การแก้ไขปัญหา

### 1. การชำระเงินไม่สำเร็จ
- ตรวจสอบ Stripe API Key
- ตรวจสอบ Network Connection
- ดู Console Logs

### 2. QR Code ไม่แสดง
- ตรวจสอบ Stripe Configuration
- ตรวจสอบ Payment Method Types
- ดู Network Response

### 3. สถานะการชำระเงินไม่อัปเดต
- ตรวจสอบ Webhook Configuration
- ตรวจสอบ Payment Status Check Interval
- ดู Browser Console

## การพัฒนาต่อ

### 1. เพิ่ม Payment Methods
- Credit Card
- Bank Transfer
- Mobile Banking

### 2. เพิ่มฟีเจอร์
- Payment History
- Refund System
- Payment Analytics

### 3. ปรับปรุง UI/UX
- Loading States
- Error Handling
- Success Animations

## หมายเหตุ
- ระบบนี้ใช้สำหรับการทดสอบเท่านั้น
- ใช้ Stripe Test Mode
- ไม่มีการชำระเงินจริง
- ข้อมูลการทดสอบจะไม่ถูกเก็บถาวร
