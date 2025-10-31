import 'dotenv/config';
import { createTransport } from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('🔍 ตรวจสอบการตั้งค่า Email...');
console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASS:', EMAIL_PASS ? '***ตั้งค่าแล้ว***' : '❌ ไม่ได้ตั้งค่า');

if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER === 'your-email@gmail.com' || EMAIL_PASS === 'your-16-character-app-password') {
  console.log('\n❌ ปัญหา: การตั้งค่า Email ไม่ถูกต้อง');
  console.log('💡 วิธีแก้ไข:');
  console.log('   1. เปิดไฟล์ backend/.env');
  console.log('   2. เปลี่ยน EMAIL_USER เป็นอีเมลจริงของคุณ');
  console.log('   3. เปลี่ยน EMAIL_PASS เป็น App Password จริง');
  console.log('   4. สำหรับ Gmail: ใช้ App Password ไม่ใช่รหัสผ่านปกติ');
  console.log('   5. ดูรายละเอียดใน EMAIL_SETUP_SIMPLE.md');
  process.exit(1);
}

console.log('\n📧 ทดสอบการเชื่อมต่อ Email...');

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function testEmail() {
  try {
    // ทดสอบการเชื่อมต่อ
    await transporter.verify();
    console.log('✅ การเชื่อมต่อ Email สำเร็จ!');
    
    // ทดสอบการส่ง email
    const testEmail = {
      from: `"Furniture KaoKai" <${EMAIL_USER}>`,
      to: EMAIL_USER, // ส่งให้ตัวเอง
      subject: 'ทดสอบการส่ง Email - Furniture KaoKai',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">ทดสอบการส่ง Email</h1>
          </div>
          <div style="padding: 20px;">
            <p>สวัสดีครับ!</p>
            <p>นี่คือการทดสอบการส่ง Email จากระบบ Furniture KaoKai</p>
            <p>หากคุณได้รับ email นี้ แสดงว่าระบบทำงานปกติ</p>
            <p>ขอบคุณครับ,<br>ทีมงาน Furniture KaoKai</p>
          </div>
        </div>
      `,
    };
    
    await transporter.sendMail(testEmail);
    console.log('✅ ส่ง Email ทดสอบสำเร็จ!');
    console.log(`📧 ตรวจสอบ inbox ของ ${EMAIL_USER}`);
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 วิธีแก้ไข:');
      console.log('   1. ตรวจสอบ EMAIL_USER และ EMAIL_PASS');
      console.log('   2. สำหรับ Gmail: ใช้ App Password ไม่ใช่รหัสผ่านปกติ');
      console.log('   3. ตรวจสอบว่า 2-Factor Authentication เปิดอยู่');
    } else if (error.message.includes('Connection timeout')) {
      console.log('\n💡 วิธีแก้ไข:');
      console.log('   1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      console.log('   2. ตรวจสอบ Firewall settings');
    }
  }
}

testEmail();
