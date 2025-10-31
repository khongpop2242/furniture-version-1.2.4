# คู่มือการตั้งค่า Email ของบริษัท

## ภาพรวม
คู่มือนี้จะช่วยคุณตั้งค่า email ของบริษัทเพื่อส่ง email reset password ให้ลูกค้า

## 🏢 สำหรับ Gmail Business (Google Workspace)

### 1. ตั้งค่า Gmail Business Account
1. ไปที่ [Google Admin Console](https://admin.google.com)
2. ใช้บัญชี admin ของบริษัท
3. เปิดใช้งาน **2-Step Verification** สำหรับบัญชีที่ใช้ส่ง email

### 2. สร้าง App Password
1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
2. คลิก **"App passwords"** ภายใต้ "2-Step Verification"
3. เลือก **"Mail"** และ **"Other (Custom name)"**
4. ใส่ชื่อ **"Furniture Business App"**
5. **คัดลอกรหัสผ่าน 16 ตัวอักษร** ที่ได้

### 3. ตั้งค่าใน .env
```env
EMAIL_USER=business@yourcompany.com
EMAIL_PASS=your-16-character-app-password
```

## 🏢 สำหรับ Outlook Business (Microsoft 365)

### 1. ตั้งค่า Microsoft 365
1. ไปที่ [Microsoft 365 Admin Center](https://admin.microsoft.com)
2. ใช้บัญชี admin ของบริษัท
3. เปิดใช้งาน **Multi-Factor Authentication**

### 2. สร้าง App Password
1. ไปที่ [Microsoft Account Security](https://account.microsoft.com/security)
2. คลิก **"Advanced security options"**
3. คลิก **"Create a new app password"**
4. ใส่ชื่อ **"Furniture Business App"**
5. **คัดลอกรหัสผ่าน** ที่ได้

### 3. ตั้งค่าใน .env
```env
EMAIL_USER=business@yourcompany.com
EMAIL_PASS=your-app-password
USE_GMAIL_SERVICE=false
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🏢 สำหรับ Email Provider อื่นๆ

### 1. Yahoo Business
```env
EMAIL_USER=business@yourcompany.com
EMAIL_PASS=your-app-password
USE_GMAIL_SERVICE=false
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Custom SMTP Server
```env
EMAIL_USER=business@yourcompany.com
EMAIL_PASS=your-password
USE_GMAIL_SERVICE=false
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🔧 การตั้งค่าใน server.ts

ระบบจะใช้การตั้งค่าจาก .env โดยอัตโนมัติ:

```typescript
// Email configuration using environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Create email transporter
const createEmailTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS is not set in environment variables.');
    return null;
  }

  // Default to Gmail service if USE_GMAIL_SERVICE is true or not explicitly false
  if (process.env.USE_GMAIL_SERVICE === 'true' || process.env.USE_GMAIL_SERVICE === undefined) {
    return createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  } else {
    // Use custom SMTP settings
    const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
    const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
    const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

    return createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }
};
```

## 📧 ตัวอย่างการใช้งาน

### 1. ตั้งค่า Gmail Business
```env
EMAIL_USER=info@furniture-kaokai.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### 2. ตั้งค่า Outlook Business
```env
EMAIL_USER=info@furniture-kaokai.com
EMAIL_PASS=your-app-password
USE_GMAIL_SERVICE=false
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 3. ตั้งค่า Custom SMTP
```env
EMAIL_USER=info@furniture-kaokai.com
EMAIL_PASS=your-password
USE_GMAIL_SERVICE=false
SMTP_HOST=mail.furniture-kaokai.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🧪 การทดสอบ

### 1. ทดสอบการตั้งค่า
```bash
cd backend
node test-customer-email.js
```

### 2. ทดสอบการส่ง email
```bash
cd backend
node verify-email-setup.js
```

## ⚠️ หมายเหตุสำคัญ

- **ใช้ App Password ไม่ใช่รหัสผ่านปกติ**
- **App Password จะมี 16 ตัวอักษร**
- **ต้องเปิด 2-Factor Authentication ก่อน**
- **ตรวจสอบ Spam folder หากลูกค้าไม่ได้รับ email**
- **ใช้ email ของบริษัทเป็นผู้ส่ง**
- **ลูกค้าจะได้รับ email ที่อีเมลของตัวเอง**

## 🔒 ความปลอดภัย

- **เก็บ App Password เป็นความลับ**
- **ไม่แชร์ App Password กับใคร**
- **เปลี่ยน App Password เป็นระยะ**
- **ใช้ HTTPS สำหรับการส่ง email**
- **ตรวจสอบ logs เป็นประจำ**

## 📞 การแก้ไขปัญหา

### ปัญหา: "Invalid login"
- ตรวจสอบ EMAIL_USER และ EMAIL_PASS
- สำหรับ Gmail: ใช้ App Password ไม่ใช่รหัสผ่านปกติ
- ตรวจสอบว่า 2-Factor Authentication เปิดอยู่

### ปัญหา: "Connection timeout"
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบ Firewall settings
- ตรวจสอบ SMTP settings

### ปัญหา: "Email not received"
- ตรวจสอบ Spam folder
- ตรวจสอบ email address ของลูกค้า
- ตรวจสอบ logs ของ server
