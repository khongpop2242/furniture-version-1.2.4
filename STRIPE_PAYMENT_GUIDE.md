# ระบบการชำระเงินผ่าน Stripe

## ภาพรวม
ระบบการชำระเงินนี้ใช้ Stripe Checkout สำหรับการชำระเงินจริง โดยรองรับการชำระเงินผ่าน PromptPay และบัตรเครดิต

## ฟีเจอร์ที่รองรับ

### 1. Stripe Checkout Integration
- ใช้ Stripe Checkout Session สำหรับการชำระเงิน
- รองรับ PromptPay QR Code
- รองรับบัตรเครดิต
- ระบบ Redirect หลังการชำระเงินสำเร็จ

### 2. หน้าจอการชำระเงิน
- แสดงข้อมูลคำสั่งซื้อ
- ปุ่ม "ชำระเงินผ่าน Stripe" 
- นำทางไปยัง Stripe Checkout Page

### 3. หน้าผลลัพธ์การชำระเงิน
- รับข้อมูลจาก Stripe Session
- แสดงข้อมูลการชำระเงินสำเร็จ
- แสดงรายละเอียดคำสั่งซื้อ

## การใช้งาน

### 1. เริ่มต้นการชำระเงิน
1. ไปที่หน้า Cart
2. คลิก "ชำระเงิน"
3. กรอกข้อมูลการจัดส่งและใบกำกับภาษี
4. คลิก "ชำระเงินผ่าน Stripe"

### 2. การชำระเงินผ่าน Stripe
- ระบบจะนำทางไปยัง Stripe Checkout Page
- เลือกวิธีการชำระเงิน (PromptPay หรือบัตรเครดิต)
- กรอกข้อมูลการชำระเงิน
- Stripe จะประมวลผลการชำระเงิน

### 3. หลังการชำระเงินสำเร็จ
- Stripe จะ redirect กลับมาที่ `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- ระบบจะดึงข้อมูล session จาก Stripe
- แสดงหน้าผลลัพธ์การชำระเงิน

## API Endpoints

### Backend API
```
POST /api/checkout/create
- สร้าง Stripe Checkout Session
- รับ: amount, email, successUrl, cancelUrl
- ส่งคืน: session.id, session.url

GET /api/checkout/session/:id
- ดึงข้อมูล Stripe Session
- ส่งคืน: session details, payment status

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
STRIPE_SECRET_KEY=sk_live_... (สำหรับ Production)
STRIPE_SECRET_KEY=sk_test_... (สำหรับ Development)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend
- API Base URL: http://localhost:5000
- Stripe Publishable Key: pk_live_... (สำหรับ Production)

## การทดสอบ

### 1. ทดสอบการสร้าง Checkout Session
```bash
curl -X POST http://localhost:5000/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "email": "test@example.com",
    "successUrl": "http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:3000/payment?canceled=true"
  }'
```

### 2. ทดสอบการดึงข้อมูล Session
```bash
curl http://localhost:5000/api/checkout/session/{session_id}
```

## Test Cards (สำหรับ Development)

### บัตรเครดิตทดสอบ
```
Visa: 4242424242424242
Mastercard: 5555555555554444
American Express: 378282246310005
```

### PromptPay
- ใช้หมายเลขโทรศัพท์จริง
- หรือ QR Code ที่สร้างโดย Stripe

## การแก้ไขปัญหา

### 1. การชำระเงินไม่สำเร็จ
- ตรวจสอบ Stripe API Keys
- ตรวจสอบ Webhook Configuration
- ดู Stripe Dashboard Logs

### 2. Redirect ไม่ทำงาน
- ตรวจสอบ successUrl และ cancelUrl
- ตรวจสอบ CORS Settings
- ดู Browser Console

### 3. Session Data ไม่ถูกต้อง
- ตรวจสอบ Session ID
- ตรวจสอบ API Response
- ดู Network Tab

## การ Deploy

### 1. Production Environment
- เปลี่ยนเป็น Live API Keys
- ตั้งค่า Webhook Endpoint
- ใช้ HTTPS

### 2. Webhook Configuration
```
Endpoint URL: https://yourdomain.com/api/stripe/webhook
Events: payment_intent.succeeded, checkout.session.completed
```

## Security Considerations

### 1. API Keys
- เก็บ Secret Key ใน Environment Variables
- ใช้ Publishable Key ใน Frontend เท่านั้น
- หมุนเวียน Keys เป็นประจำ

### 2. Webhook Security
- ตรวจสอบ Webhook Signature
- ใช้ HTTPS เท่านั้น
- จำกัด IP Addresses

### 3. Data Protection
- ไม่เก็บข้อมูลบัตรเครดิต
- ใช้ Stripe Elements
- ปฏิบัติตาม PCI DSS

## หมายเหตุ
- ระบบนี้ใช้ Stripe Checkout สำหรับการชำระเงินจริง
- รองรับการชำระเงินผ่าน PromptPay และบัตรเครดิต
- มีระบบ Webhook สำหรับการอัปเดตสถานะ
- ข้อมูลการชำระเงินจะถูกเก็บใน Stripe