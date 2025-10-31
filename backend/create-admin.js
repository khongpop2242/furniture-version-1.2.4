import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 กำลังสร้าง Admin User...');

    // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ พบ Admin User อยู่แล้ว:', existingAdmin.email);
      return;
    }

    // สร้าง admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@furniture.com',
        password: hashedPassword,
        phone: '081-234-5678',
        address: 'สำนักงานใหญ่',
        role: 'ADMIN'
      }
    });

    console.log('✅ สร้าง Admin User สำเร็จ!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
