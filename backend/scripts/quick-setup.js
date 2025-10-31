import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Quick Setup - ตั้งค่าฐานข้อมูล MySQL แบบรวดเร็ว');

// ตรวจสอบไฟล์ .env
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ ไม่พบไฟล์ .env');
  console.log('💡 กรุณาสร้างไฟล์ .env โดยคัดลอกจาก env.example');
  console.log('   copy env.example .env');
  console.log('   แล้วแก้ไขข้อมูลการเชื่อมต่อฐานข้อมูล');
  process.exit(1);
}

console.log('✅ พบไฟล์ .env');

// รันคำสั่งตามลำดับ
const commands = [
  { name: 'ทดสอบการเชื่อมต่อ', cmd: 'npm run db:test' },
  { name: 'สร้างฐานข้อมูลและตาราง', cmd: 'npm run db:setup' },
  { name: 'เพิ่มข้อมูลตัวอย่าง', cmd: 'npm run db:seed-all' }
];

for (const command of commands) {
  try {
    console.log(`\n🔄 ${command.name}...`);
    execSync(command.cmd, { stdio: 'inherit' });
    console.log(`✅ ${command.name} สำเร็จ`);
  } catch (error) {
    console.log(`❌ ${command.name} ล้มเหลว`);
    console.log('💡 กรุณาตรวจสอบการตั้งค่าและลองใหม่อีกครั้ง');
    process.exit(1);
  }
}

console.log('\n🎉 Quick Setup เสร็จสิ้น!');
console.log('💡 รัน "npm run dev" เพื่อเริ่มต้นเซิร์ฟเวอร์'); 