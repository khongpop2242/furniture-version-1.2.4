import 'dotenv/config';
import { createTransport } from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER; // Gmail ของคุณ (ผู้ส่ง)
const EMAIL_PASS = process.env.EMAIL_PASS; // App Password ของคุณ

console.log('📧 ตัวอย่างการส่ง Email ให้ลูกค้า');
console.log('ผู้ส่ง (คุณ):', EMAIL_USER);
console.log('ผู้รับ (ลูกค้า): customer@gmail.com');

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER, // Gmail ของคุณ
    pass: EMAIL_PASS,  // App Password ของคุณ
  },
});

async function sendEmailToCustomer() {
  const customerEmail = 'customer@gmail.com'; // อีเมลของลูกค้า
  const customerName = 'ลูกค้า';
  const resetUrl = 'http://localhost:3000/reset-password?token=abc123';
  
  try {
    const mailOptions = {
      from: `"Furniture KaoKai" <${EMAIL_USER}>`, // ส่งจาก Gmail ของคุณ
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
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

sendEmailToCustomer();
