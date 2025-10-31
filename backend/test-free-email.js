import 'dotenv/config';
import { createTransport } from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER; // Email ฟรี
const EMAIL_PASS = process.env.EMAIL_PASS; // App Password
const USE_GMAIL_SERVICE = process.env.USE_GMAIL_SERVICE;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE;

console.log('🆓 ทดสอบการตั้งค่า Email ฟรี');
console.log('Email ฟรี:', EMAIL_USER);
console.log('App Password:', EMAIL_PASS ? '***ตั้งค่าแล้ว***' : '❌ ไม่ได้ตั้งค่า');
console.log('ใช้ Gmail Service:', USE_GMAIL_SERVICE !== 'false' ? 'ใช่' : 'ไม่');
if (USE_GMAIL_SERVICE === 'false') {
  console.log('SMTP Host:', SMTP_HOST);
  console.log('SMTP Port:', SMTP_PORT);
  console.log('SMTP Secure:', SMTP_SECURE);
}

// ตรวจสอบการตั้งค่า
if (!EMAIL_USER || !EMAIL_PASS || 
    EMAIL_USER.includes('your-') || 
    EMAIL_PASS.includes('your-')) {
  console.log('\n❌ ปัญหา: การตั้งค่า Email ยังใช้ค่า placeholder');
  console.log('💡 วิธีแก้ไข:');
  console.log('   1. เปิดไฟล์ backend/.env');
  console.log('   2. เปลี่ยน EMAIL_USER เป็น email ฟรีของคุณ');
  console.log('   3. เปลี่ยน EMAIL_PASS เป็น App Password ของคุณ');
  console.log('   4. ดูรายละเอียดใน FREE_EMAIL_SETUP.md');
  process.exit(1);
}

// สร้าง transporter
const createEmailTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS is not set in environment variables.');
    return null;
  }

  // Default to Gmail service if USE_GMAIL_SERVICE is true or not explicitly false
  if (USE_GMAIL_SERVICE === 'true' || USE_GMAIL_SERVICE === undefined) {
    return createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  } else {
    // Use custom SMTP settings
    const host = SMTP_HOST || 'smtp.example.com';
    const port = parseInt(SMTP_PORT || '587', 10);
    const secure = SMTP_SECURE === 'true';

    return createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }
};

const transporter = createEmailTransporter();

async function testFreeEmail() {
  const customerEmail = 'customer@gmail.com'; // อีเมลของลูกค้า
  const customerName = 'ลูกค้า';
  const resetUrl = 'http://localhost:3000/reset-password?token=abc123';
  
  try {
    console.log('🔄 กำลังทดสอบการเชื่อมต่อ...');
    await transporter.verify();
    console.log('✅ การเชื่อมต่อ Email ฟรีสำเร็จ!');
    
    console.log('🔄 กำลังส่ง email ไปยังลูกค้า...');
    const mailOptions = {
      from: `"Furniture KaoKai" <${EMAIL_USER}>`, // ส่งจาก email ฟรี
      to: customerEmail, // ส่งไปยังลูกค้า
      subject: 'รีเซ็ตรหัสผ่านของคุณ - Furniture KaoKai',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">รีเซ็ตรหัสผ่าน</h1>
          </div>
          <div style="padding: 20px;">
            <p>สวัสดีคุณ ${customerName},</p>
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
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ ส่ง email ไปยังลูกค้าสำเร็จ!');
    console.log(`📧 ลูกค้าจะได้รับ email ที่ ${customerEmail}`);
    console.log(`📧 ส่งจาก: ${EMAIL_USER}`);
    console.log('🎉 ระบบพร้อมใช้งานแล้ว!');
    console.log('💰 ใช้บริการฟรี 100%');
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.message.includes('Invalid login') || error.message.includes('BadCredentials')) {
      console.log('\n💡 วิธีแก้ไข:');
      console.log('   1. ตรวจสอบ EMAIL_USER และ EMAIL_PASS');
      console.log('   2. สำหรับ Gmail: ใช้ App Password ไม่ใช่รหัสผ่านปกติ');
      console.log('   3. ตรวจสอบว่า 2-Factor Authentication เปิดอยู่');
      console.log('   4. App Password ต้องมี 16 ตัวอักษร');
    } else if (error.message.includes('Connection timeout')) {
      console.log('\n💡 วิธีแก้ไข:');
      console.log('   1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      console.log('   2. ตรวจสอบ Firewall settings');
      console.log('   3. ตรวจสอบ SMTP settings');
    }
  }
}

testFreeEmail();
