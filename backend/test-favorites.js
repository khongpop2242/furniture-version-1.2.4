import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFavorites() {
  console.log('🧪 ทดสอบฟังก์ชัน Favorites');
  
  try {
    // 1. ทดสอบการสร้าง Favorite
    console.log('\n1. ทดสอบการสร้าง Favorite...');
    const testUser = await prisma.user.findFirst();
    const testProduct = await prisma.product.findFirst();
    
    if (!testUser || !testProduct) {
      console.log('❌ ไม่พบข้อมูลผู้ใช้หรือสินค้าสำหรับทดสอบ');
      return;
    }
    
    console.log(`👤 ผู้ใช้: ${testUser.name} (ID: ${testUser.id})`);
    console.log(`📦 สินค้า: ${testProduct.name} (ID: ${testProduct.id})`);
    
    // 2. ทดสอบการเพิ่ม Favorite
    console.log('\n2. ทดสอบการเพิ่ม Favorite...');
    const favorite = await prisma.favorite.create({
      data: {
        userId: testUser.id,
        productId: testProduct.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        product: {
          select: { name: true, price: true }
        }
      }
    });
    
    console.log('✅ สร้าง Favorite สำเร็จ:');
    console.log(`   - ผู้ใช้: ${favorite.user.name}`);
    console.log(`   - สินค้า: ${favorite.product.name}`);
    console.log(`   - ราคา: ${favorite.product.price} บาท`);
    console.log(`   - วันที่: ${favorite.createdAt}`);
    
    // 3. ทดสอบการดึง Favorites ของผู้ใช้
    console.log('\n3. ทดสอบการดึง Favorites ของผู้ใช้...');
    const userFavorites = await prisma.favorite.findMany({
      where: { userId: testUser.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ พบ Favorites ${userFavorites.length} รายการ:`);
    userFavorites.forEach((fav, index) => {
      console.log(`   ${index + 1}. ${fav.product.name} - ${fav.product.price} บาท`);
    });
    
    // 4. ทดสอบการตรวจสอบ Favorite
    console.log('\n4. ทดสอบการตรวจสอบ Favorite...');
    const isFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: testUser.id,
          productId: testProduct.id
        }
      }
    });
    
    console.log(`✅ สินค้า ${testProduct.name} ${isFavorite ? 'อยู่ใน' : 'ไม่อยู่ใน'} รายการโปรด`);
    
    // 5. ทดสอบการลบ Favorite
    console.log('\n5. ทดสอบการลบ Favorite...');
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId: testUser.id,
          productId: testProduct.id
        }
      }
    });
    
    console.log('✅ ลบ Favorite สำเร็จ');
    
    // 6. ทดสอบการตรวจสอบ Favorite หลังลบ
    console.log('\n6. ทดสอบการตรวจสอบ Favorite หลังลบ...');
    const isFavoriteAfterDelete = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: testUser.id,
          productId: testProduct.id
        }
      }
    });
    
    console.log(`✅ สินค้า ${testProduct.name} ${isFavoriteAfterDelete ? 'ยังอยู่ใน' : 'ไม่อยู่ใน'} รายการโปรด`);
    
    console.log('\n🎉 ทดสอบฟังก์ชัน Favorites สำเร็จ!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFavorites();
