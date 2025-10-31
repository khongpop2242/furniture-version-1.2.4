import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ฟังก์ชันสำหรับดึงรูปภาพจากโฟลเดอร์ public/images/products
  const getProductImage = (product) => {
    if (product.model) {
      // ใช้รหัสสินค้า (model) เป็นชื่อไฟล์รูป .jpg
      return `/images/products/${product.model}.jpg`;
    }
    return '';
  };

  useEffect(() => {
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
      setLoading(false);
    } else {
      setError('ไม่พบข้อมูลคำสั่งซื้อ');
      setLoading(false);
    }
  }, [location.state]);

  const handleBackToCheckout = () => {
    navigate('/checkout');
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  // ฟังก์ชันสำหรับสร้างการชำระเงินผ่าน Stripe Checkout
  const handleCreatePayment = async () => {
    if (!orderData) return;
    
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // ดึง user ID จาก token
      let userId = null;
      if (token) {
        try {
          const userResponse = await axios.get(getApiUrl('api/user'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          userId = userResponse.data?.id;
        } catch (err) {
          console.log('Could not get user ID:', err);
        }
      }

      // ส่งข้อมูลการจัดส่งไปยัง backend
      const deliveryDetails = orderData.deliveryMethod === 'delivery' 
        ? JSON.stringify(orderData.deliveryAddress)
        : JSON.stringify(orderData.pickupAddress);

      const response = await axios.post(getApiUrl('api/checkout/create'), {
        amount: orderData.totalAmount * 100, // แปลงเป็น satang
        email: orderData.customerEmail,
        userId: userId,
        deliveryMethod: orderData.deliveryMethod || 'pickup',
        deliveryDetails: deliveryDetails,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment?canceled=true`
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data && response.data.url) {
        // นำทางไปยัง Stripe Checkout
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      alert('เกิดข้อผิดพลาดในการสร้างการชำระเงิน');
      setPaymentLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error || 'ไม่พบข้อมูลคำสั่งซื้อ'}</p>
            <div className="error-actions">
              <button onClick={handleBackToCheckout} className="btn btn-primary">
                กลับไปหน้า Checkout
              </button>
              <button onClick={handleBackToCart} className="btn btn-secondary">
                กลับไปตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <h1>การชำระเงิน</h1>
        </div>

        <div className="payment-content">
          <div className="payment-left">
            {/* Progress Steps */}
            <div className="progress-steps">
              <div className="step completed">
                <i className="fas fa-shipping-fast"></i>
                <span>การจัดส่ง</span>
              </div>
              <div className="step active">
                <i className="fas fa-credit-card"></i>
                <span>การชำระเงิน</span>
              </div>
              <div className="step">
                <i className="fas fa-check"></i>
                <span>เสร็จสิ้น</span>
              </div>
            </div>

            {/* ข้อมูลการจัดส่ง */}
            <div className="delivery-info">
              <h2>ข้อมูลการจัดส่ง</h2>
              <div className="info-section">
                <h4>วิธีการจัดส่ง:</h4>
                <p>{orderData.deliveryMethod === 'pickup' ? 'รับที่ร้าน' : 'จัดส่งที่บ้าน'}</p>
                
                {orderData.deliveryMethod === 'pickup' && orderData.pickupAddress && (
                  <div>
                    <h4>ที่อยู่รับสินค้า:</h4>
                    <div className="address-details">
                      <p><strong>ชื่อบริษัท:</strong> {orderData.pickupAddress.companyName}</p>
                      <p><strong>ที่อยู่:</strong> {orderData.pickupAddress.address}</p>
                      <p><strong>เบอร์โทรศัพท์:</strong> {orderData.pickupAddress.phone}</p>
                      <p><strong>วันทำการ:</strong> {orderData.pickupAddress.workingHours}</p>
                    </div>
                  </div>
                )}

                {orderData.deliveryMethod === 'delivery' && orderData.deliveryAddress && (
                  <div>
                    <h4>ที่อยู่จัดส่ง:</h4>
                    <div className="address-details">
                      <p><strong>ชื่อบริษัท/บุคคล:</strong> {orderData.deliveryAddress.companyName}</p>
                      <p><strong>ชื่อผู้ติดต่อ:</strong> {orderData.deliveryAddress.contactName}</p>
                      <p><strong>ที่อยู่:</strong> {orderData.deliveryAddress.address}</p>
                      {(orderData.deliveryAddress.district || orderData.deliveryAddress.amphoe || orderData.deliveryAddress.province) && (
                        <p><strong>ตำบล/อำเภอ/จังหวัด:</strong> {[orderData.deliveryAddress.district, orderData.deliveryAddress.amphoe, orderData.deliveryAddress.province].filter(Boolean).join(' ')}</p>
                      )}
                      {orderData.deliveryAddress.postalCode && (
                        <p><strong>รหัสไปรษณีย์:</strong> {orderData.deliveryAddress.postalCode}</p>
                      )}
                      <p><strong>เบอร์โทรศัพท์:</strong> {orderData.deliveryAddress.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ข้อมูลใบกำกับภาษี */}
            {orderData.needInvoice && orderData.invoiceData && (
              <div className="invoice-info">
                <h2>ข้อมูลใบกำกับภาษี</h2>
                <div className="info-section">
                  <div className="address-details">
                    <p><strong>ชื่อบริษัท/บุคคล:</strong> {orderData.invoiceData.companyName}</p>
                    <p><strong>ชื่อผู้ติดต่อ:</strong> {orderData.invoiceData.contactName}</p>
                    <p><strong>ที่อยู่:</strong> {orderData.invoiceData.address}</p>
                    <p><strong>เบอร์โทรศัพท์:</strong> {orderData.invoiceData.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="payment-right">
            {/* ข้อมูลลูกค้า */}
            <div className="customer-info">
              <h3>ข้อมูลลูกค้า</h3>
              <div className="customer-details">
                <p><strong>ชื่อ:</strong> {orderData.customerName}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {orderData.customerPhone}</p>
                <p><strong>อีเมล:</strong> {orderData.customerEmail}</p>
              </div>
            </div>

            {/* สรุปคำสั่งซื้อ */}
            <div className="order-summary">
              <h3>คำสั่งซื้อ เลขที่ {orderData.orderNumber}</h3>
              <div className="order-items">
                {orderData.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      {getProductImage(item.product) ? (
                        <img 
                          src={getProductImage(item.product)} 
                          alt={item.product.name}
                        />
                      ) : (
                        <img 
                          src="/images/NoImage.png" 
                          alt={item.product.name}
                        />
                      )}
                    </div>
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p className="product-code">รหัสสินค้า {item.product.model}</p>
                      <p className="item-price">รวม: {item.product.price.toLocaleString()} บาท</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <p><strong>ยอดรวม: {orderData.totalAmount.toLocaleString()} บาท</strong></p>
              </div>
            </div>


            {/* ปุ่มการดำเนินการ */}
            <div className="payment-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleBackToCheckout}
                disabled={paymentLoading}
              >
                <i className="fas fa-arrow-left"></i> กลับไปแก้ไข
              </button>
              
              <button 
                className="btn btn-primary payment-btn"
                onClick={handleCreatePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> กำลังนำไปยัง Stripe...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card"></i> ชำระเงินผ่าน Stripe
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
