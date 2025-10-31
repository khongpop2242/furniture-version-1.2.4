import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ทดสอบการลด stock โดยตรง
async function testStockUpdate() {
  try {
    console.log('🔄 กำลังทดสอบการลด stock...');
    
    // 1. ดู stock ก่อน
    console.log('\n📦 Stock ก่อนอัปเดต:');
    const productsBefore = await prisma.product.findMany({
      select: { id: true, name: true, stock: true }
    });
    
    productsBefore.slice(0, 3).forEach(product => {
      console.log(`- ${product.name}: ${product.stock} ชิ้น`);
    });
    
    // 2. ลด stock โดยตรง
    const productId = 1; // เปลี่ยนเป็น ID ที่ต้องการทดสอบ
    const reduceQuantity = 1;
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (product) {
      const newStock = product.stock - reduceQuantity;
      console.log(`\n📦 ลด stock: ${product.name} จาก ${product.stock} เป็น ${newStock}`);
      
      await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock }
      });
      
      console.log('✅ Stock อัปเดตสำเร็จ');
    }
    
    // 3. ดู stock หลัง
    console.log('\n📦 Stock หลังอัปเดต:');
    const productsAfter = await prisma.product.findMany({
      select: { id: true, name: true, stock: true }
    });
    
    productsAfter.slice(0, 3).forEach(product => {
      console.log(`- ${product.name}: ${product.stock} ชิ้น`);
    });
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStockUpdate();
