import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('👤 กำลังสร้าง User ปกติ...');

    // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: { email: 'user@furniture.com' }
    });

    if (existingUser) {
      console.log('✅ พบ User อยู่แล้ว:', existingUser.email);
      return;
    }

    // สร้าง user ปกติ
    const hashedPassword = await bcrypt.hash('user123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'User Test',
        email: 'user@furniture.com',
        password: hashedPassword,
        phone: '089-876-5432',
        address: '123 ถนนสุขุมวิท กรุงเทพฯ',
        role: 'USER'
      }
    });

    console.log('✅ สร้าง User สำเร็จ!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: user123');
    console.log('👤 Role:', user.role);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
