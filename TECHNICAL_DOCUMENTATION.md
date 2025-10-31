# เอกสารเทคนิค: ระบบส่ง Email Reset Password

## 📋 ภาพรวมระบบ

ระบบส่ง Email Reset Password ใช้เทคโนโลยีต่อไปนี้:

1. **Node.js** - Runtime environment
2. **Express.js** - Web framework
3. **Nodemailer** - Email sending library
4. **Prisma** - Database ORM
5. **TypeScript** - Programming language
6. **MySQL** - Database

## 🛠️ ฟังก์ชันหลักที่ใช้

### 1. ฟังก์ชันสร้าง Email Transporter
```typescript
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

### 2. ฟังก์ชันส่ง Email Reset Password
```typescript
const sendPasswordResetEmail = async (toEmail: string, userName: string, resetUrl: string) => {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    console.error('Email transporter is not initialized. Cannot send email.');
    return false;
  }

  const mailOptions = {
    from: `"Furniture KaoKai" <${EMAIL_USER}>`,
    to: toEmail,
    subject: 'รีเซ็ตรหัสผ่านของคุณ - Furniture KaoKai',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">รีเซ็ตรหัสผ่าน</h1>
        </div>
        <div style="padding: 20px;">
          <p>สวัสดีคุณ ${userName},</p>
          <p>คุณได้รับการร้องขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
          <p>กรุณาคลิกที่ปุ่มด้านล่างเพื่อดำเนินการรีเซ็ตรหัสผ่าน:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              รีเซ็ตรหัสผ่านของคุณ
            </a>
          </p>
          <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
          <p>หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่านนี้ โปรดละเว้นอีเมลนี้</p>
          <p>ขอบคุณ,<br>ทีมงาน Furniture KaoKai</p>
        </div>
        <div style="background-color: #f8f9fa; color: #6c757d; padding: 15px; text-align: center; font-size: 0.8em;">
          <p>&copy; ${new Date().getFullYear()} Furniture KaoKai. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully to:', toEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};
```

### 3. API Endpoint สำหรับ Forgot Password
```typescript
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'กรุณากรอกอีเมล' });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // Create reset URL
    const resetUrl = `${req.headers.origin || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email using built-in Node.js modules
    await sendPasswordResetEmail(email, user.name, resetUrl);

    res.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้' });
  } catch (e: any) {
    console.error('Forgot password error:', e);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});
```

## 🔧 Libraries และ Dependencies ที่ใช้

### 1. Nodemailer
```json
{
  "nodemailer": "^6.9.0",
  "@types/nodemailer": "^6.4.0"
}
```

### 2. Express.js
```json
{
  "express": "^4.18.0",
  "@types/express": "^4.17.0"
}
```

### 3. Prisma
```json
{
  "@prisma/client": "^6.13.0",
  "prisma": "^6.13.0"
}
```

### 4. TypeScript
```json
{
  "typescript": "^5.4.5",
  "@types/node": "^20.0.0"
}
```

## 📧 Email Service Configuration

### 1. Environment Variables
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
USE_GMAIL_SERVICE=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Gmail Configuration
```typescript
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
```

### 3. Custom SMTP Configuration
```typescript
const transporter = createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
```

## 🔄 กระบวนการทำงาน

### 1. ลูกค้าลืมรหัสผ่าน
1. ลูกค้าไปที่หน้า Login
2. คลิก "ลืมรหัสผ่าน?"
3. กรอกอีเมลของตัวเอง
4. ส่ง POST request ไปยัง `/api/auth/forgot-password`

### 2. ระบบประมวลผล
1. ตรวจสอบว่าอีเมลมีอยู่ในฐานข้อมูลหรือไม่
2. สร้าง reset token
3. บันทึก reset token ลงฐานข้อมูล
4. สร้าง reset URL
5. ส่ง email ไปยังลูกค้า

### 3. ลูกค้ารีเซ็ตรหัสผ่าน
1. ลูกค้าได้รับ email
2. คลิกลิงก์ใน email
3. ไปที่หน้า reset password
4. ตั้งรหัสผ่านใหม่
5. เข้าสู่ระบบได้

## 🛡️ ความปลอดภัย

### 1. Token Security
- Reset token มีความยาว 30 ตัวอักษร
- Token หมดอายุใน 1 ชั่วโมง
- Token ใช้ได้ครั้งเดียว

### 2. Email Security
- ใช้ App Password แทนรหัสผ่านปกติ
- ใช้ HTTPS สำหรับการส่ง email
- ตรวจสอบ email address ก่อนส่ง

### 3. Database Security
- ใช้ Prisma ORM เพื่อป้องกัน SQL injection
- ใช้ environment variables สำหรับ sensitive data
- ใช้ JWT สำหรับ authentication

## 📊 Performance และ Scalability

### 1. Email Sending
- ใช้ Nodemailer connection pooling
- รองรับการส่ง email จำนวนมาก
- มี error handling และ retry mechanism

### 2. Database
- ใช้ Prisma connection pooling
- รองรับ concurrent requests
- มี proper indexing

### 3. Caching
- ใช้ Redis สำหรับ session storage
- Cache email templates
- Cache user data

## 🧪 Testing

### 1. Unit Testing
```typescript
describe('Email Service', () => {
  it('should send password reset email', async () => {
    const result = await sendPasswordResetEmail(
      'test@example.com',
      'Test User',
      'http://localhost:3000/reset-password?token=abc123'
    );
    expect(result).toBe(true);
  });
});
```

### 2. Integration Testing
```typescript
describe('Forgot Password API', () => {
  it('should return success message', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'test@example.com' });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้');
  });
});
```

## 📈 Monitoring และ Logging

### 1. Email Logging
```typescript
console.log('✅ Password reset email sent successfully to:', toEmail);
console.error('❌ Error sending email:', error);
```

### 2. Database Logging
```typescript
console.log('🔍 User found:', user.email);
console.log('🔑 Reset token generated:', resetToken);
```

### 3. Error Handling
```typescript
try {
  await transporter.sendMail(mailOptions);
  return true;
} catch (error) {
  console.error('❌ Error sending email:', error);
  return false;
}
```

## 🔧 Configuration Management

### 1. Environment Variables
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
USE_GMAIL_SERVICE=true

# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/database

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 📚 Documentation

### 1. API Documentation
- GET /api/products - รายการสินค้าทั้งหมด
- POST /api/auth/forgot-password - ลืมรหัสผ่าน
- POST /api/auth/reset-password - รีเซ็ตรหัสผ่าน

### 2. Code Documentation
- JSDoc comments สำหรับ functions
- TypeScript type definitions
- README files สำหรับ setup

### 3. User Documentation
- คู่มือการใช้งานสำหรับผู้ใช้
- คู่มือการตั้งค่าสำหรับผู้ดูแลระบบ
- FAQ และ troubleshooting guide
