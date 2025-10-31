import axios from 'axios';

// ทดสอบการสร้างคำสั่งซื้อ
async function testOrderCreation() {
  try {
    console.log('🔄 กำลังทดสอบการสร้างคำสั่งซื้อ...');
    
    // 1. ดู stock ก่อน
    console.log('\n📦 Stock ก่อนสร้างคำสั่งซื้อ:');
    const productsResponse = await axios.get('http://localhost:5050/api/products');
    const products = productsResponse.data;
    
    products.slice(0, 3).forEach(product => {
      console.log(`- ${product.name}: ${product.stock} ชิ้น`);
    });
    
    // 2. สร้างคำสั่งซื้อทดสอบ
    console.log('\n🛒 สร้างคำสั่งซื้อทดสอบ...');
    const testOrder = {
      items: [
        {
          id: 1,
          name: products[0].name,
          price: products[0].price,
          quantity: 1
        }
      ],
      shippingAddress: 'ที่อยู่ทดสอบ'
    };
    
    // ใช้ token ของ user ที่ล็อกอินอยู่
    const token = 'your-jwt-token-here'; // ใส่ token จริง
    
    try {
      const orderResponse = await axios.post('http://localhost:5050/api/orders', testOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ สร้างคำสั่งซื้อสำเร็จ:', orderResponse.data.id);
      
      // 3. ดู stock หลัง
      console.log('\n📦 Stock หลังสร้างคำสั่งซื้อ:');
      const productsAfterResponse = await axios.get('http://localhost:5050/api/products');
      const productsAfter = productsAfterResponse.data;
      
      productsAfter.slice(0, 3).forEach(product => {
        console.log(`- ${product.name}: ${product.stock} ชิ้น`);
      });
      
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
  }
}

testOrderCreation();
