import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 ตรวจสอบข้อมูลสินค้าในฐานข้อมูล...\n');

    // ตรวจสอบจำนวนสินค้า
    const productCount = await prisma.product.count();
    console.log(`📊 จำนวนสินค้าทั้งหมด: ${productCount} รายการ`);

    if (productCount === 0) {
      console.log('❌ ไม่พบข้อมูลสินค้าในฐานข้อมูล!');
      console.log('💡 แนะนำให้รันคำสั่ง: npm run db:seed');
      return;
    }

    // แสดงข้อมูลสินค้าทั้งหมด
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        model: true,
        price: true,
        category: true,
        stock: true,
        isBestSeller: true,
        isOnSale: true
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n📋 รายการสินค้า:');
    products.forEach((product, index) => {
      const badges = [];
      if (product.isBestSeller) badges.push('🔥 ขายดี');
      if (product.isOnSale) badges.push('💰 ลดราคา');
      
      console.log(`   ${index + 1}. ${product.name} (${product.model})`);
      console.log(`      หมวดหมู่: ${product.category}`);
      console.log(`      ราคา: ฿${product.price.toLocaleString()}`);
      console.log(`      สต็อก: ${product.stock} ชิ้น`);
      if (badges.length > 0) {
        console.log(`      ${badges.join(' | ')}`);
      }
      console.log('');
    });

    // ตรวจสอบหมวดหมู่
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });

    console.log('🏷️ หมวดหมู่สินค้า:');
    categories.forEach(cat => {
      console.log(`   - ${cat.category}`);
    });

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 แนะนำ:');
      console.log('   1. ตรวจสอบว่า MySQL Server ทำงานอยู่');
      console.log('   2. ตรวจสอบการตั้งค่า DATABASE_URL ใน .env');
      console.log('   3. รันคำสั่ง: npm run db:push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
