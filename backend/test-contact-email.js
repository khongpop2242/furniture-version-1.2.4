import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

// ทดสอบการส่งอีเมล
async function testEmail() {
  try {
    console.log('🔄 กำลังทดสอบการส่งอีเมล...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER || 'ไม่พบ');
    console.log('🔑 EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'ไม่พบ');
    
    // สร้าง transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'furniture.kaokai@gmail.com',
        pass: process.env.EMAIL_PASS || 'oftbawaohsscitgn'
      }
    });
    
    // ทดสอบการเชื่อมต่อ
    await transporter.verify();
    console.log('✅ การเชื่อมต่ออีเมลสำเร็จ');
    
    // ส่งอีเมลทดสอบ
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: 'info@kaokaioffice.com',
      subject: '🧪 ทดสอบระบบส่งอีเมล',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🧪 ทดสอบระบบส่งอีเมล</h2>
          <p>นี่คืออีเมลทดสอบจากระบบ KaokaiOfficeFurniture</p>
          <p><strong>เวลาที่ส่ง:</strong> ${new Date().toLocaleString('th-TH')}</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ อีเมลส่งสำเร็จ:', result.messageId);
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.log('\n📋 วิธีแก้ไข:');
    console.log('1. ตั้งค่า EMAIL_USER และ EMAIL_PASS ในไฟล์ .env');
    console.log('2. ใช้ App Password แทนรหัสผ่านปกติ');
    console.log('3. เปิด 2-Factor Authentication ใน Gmail');
  }
}

testEmail();
