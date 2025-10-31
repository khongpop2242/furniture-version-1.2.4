import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);


  const fetchSessionData = useCallback(async (sessionId) => {
    try {
      // ดึงข้อมูล session
      const sessionResponse = await axios.get(getApiUrl(`api/checkout/session/${sessionId}`));
      setSessionData(sessionResponse.data);
      
      // สร้างคำสั่งซื้อจาก session
      try {
        const orderResponse = await axios.post(getApiUrl(`api/checkout/session/${sessionId}/create-order`));
        console.log('✅ Order created:', orderResponse.data);
      } catch (orderError) {
        console.log('⚠️ Order might already exist or error occurred:', orderError.response?.data?.message);
      }
      
      // ดึงข้อมูลคำสั่งซื้อล่าสุดจากฐานข้อมูล
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const ordersResponse = await axios.get(getApiUrl('api/orders'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (ordersResponse.data && ordersResponse.data.length > 0) {
            // ใช้คำสั่งซื้อล่าสุด
            const latestOrder = ordersResponse.data[0];
            
            // เก็บ orderId เพื่อใช้สำหรับ navigate ไปหน้า OrderDetail
            setOrderId(latestOrder.id);
            
            const orderData = {
              orderNumber: latestOrder.id,
              totalAmount: parseFloat(latestOrder.total),
              customerName: latestOrder.user?.name || 'ลูกค้า',
              customerEmail: latestOrder.user?.email || sessionResponse.data.customer_email,
              customerPhone: 'ไม่ระบุ',
              items: latestOrder.orderItems.map((item, index) => ({
                id: item.id || index + 1,
                product: {
                  name: item.name,
                  model: item.product?.model || 'ORDER-' + String(index + 1).padStart(3, '0'),
                  price: parseFloat(item.price)
                },
                quantity: item.quantity
              })),
              deliveryMethod: latestOrder.deliveryMethod || 'pickup',
              deliveryDetails: latestOrder.deliveryDetails || null,
              pickupAddress: latestOrder.deliveryMethod === 'pickup' ? {
                companyName: 'อาร์ดีเอ็น (ประเทศไทย) จำกัด',
                address: '99/5 หมู่ที่ 5 ตำบลไทรน้อย อำเภอไทรน้อย จังหวัดนนทบุรี 11150',
                phone: '092-7605-230',
                workingHours: 'ทุกวัน 08:00-19:00 น.'
              } : null,
              deliveryAddress: latestOrder.deliveryMethod === 'delivery' && latestOrder.deliveryDetails ? JSON.parse(latestOrder.deliveryDetails) : null
            };
            
            console.log('✅ Order data fetched from orders:', orderData);
            setOrderData(orderData);
          } else {
            throw new Error('No orders found');
          }
        } else {
          throw new Error('No token found');
        }
      } catch (orderError) {
        console.log('⚠️ Could not fetch order data, trying fallback:', orderError.message);
        
        // Fallback: ใช้ข้อมูลจาก session
        const fallbackOrderData = {
          orderNumber: sessionId.substring(0, 10),
          totalAmount: sessionResponse.data.amount_total / 100,
          customerName: 'ลูกค้า',
          customerEmail: sessionResponse.data.customer_email,
          customerPhone: 'ไม่ระบุ',
          items: [{
            id: 1,
            product: {
              name: 'คำสั่งซื้อจากตะกร้า',
              model: 'ORDER-001',
              price: sessionResponse.data.amount_total / 100
            },
            quantity: 1
          }],
          deliveryMethod: 'pickup',
          pickupAddress: {
            companyName: 'อาร์ดีเอ็น (ประเทศไทย) จำกัด',
            address: '99/5 หมู่ที่ 5 ตำบลไทรน้อย อำเภอไทรน้อย จังหวัดนนทบุรี 11150',
            phone: '092-7605-230',
            workingHours: 'ทุกวัน 08:00-19:00 น.'
          }
        };
        
        setOrderData(fallbackOrderData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching session data:', error);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    
    if (location.state?.orderData) {
      // ใช้ข้อมูลจาก state (ข้อมูลที่ส่งมาจาก Payment.js)
      setOrderData(location.state.orderData);
      setSessionData({ id: 'test_session_' + Date.now() });
      setLoading(false);
    } else if (sessionId) {
      // ดึงข้อมูล session จาก Stripe
      fetchSessionData(sessionId);
    } else {
      // ถ้าไม่มีข้อมูล ให้ไปหน้าแรก
      navigate('/');
    }
  }, [location, navigate, fetchSessionData]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  const handleDownloadReceipt = () => {
    // ใช้ orderId ที่ได้จากคำสั่งซื้อล่าสุดเพื่อ navigate ไปหน้า OrderDetail
    if (orderId) {
      // เปิดหน้าต่างใหม่สำหรับพิมพ์ใบกำกับภาษี
      window.open(`/order/${orderId}`, '_blank');
    } else if (orderData?.orderNumber) {
      // กรณีที่ไม่มี orderId ให้ใช้ orderNumber
      window.open(`/order/${orderData.orderNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="success-page">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="success-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle"></i>
            <p>ไม่พบข้อมูลคำสั่งซื้อ</p>
            <button onClick={handleBackToHome} className="btn btn-primary">
              กลับไปหน้าแรก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">
      <div className="container">
        <div className="success-header">
          <h1>การจัดส่ง</h1>
        </div>

        <div className="success-content">
          <div className="success-left">
            {/* Progress Steps */}
            <div className="progress-steps">
              <div className="step completed">
                <i className="fas fa-shipping-fast"></i>
                <span>การจัดส่ง</span>
              </div>
              <div className="step completed">
                <i className="fas fa-credit-card"></i>
                <span>การชำระเงิน</span>
              </div>
              <div className="step completed">
                <i className="fas fa-check"></i>
                <span>เสร็จสิ้น</span>
              </div>
            </div>

            {/* Success Message */}
            <div className="success-message">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>ชำระเงินสำเร็จ!</h2>
              <p>คำสั่งซื้อของคุณได้รับการยืนยันแล้ว</p>
              <p>หมายเลขคำสั่งซื้อ: <strong>#{orderData.orderNumber}</strong></p>
              <p>หมายเลขการชำระเงิน: <strong>{sessionData?.id || 'ไม่ระบุ'}</strong></p>
            </div>

          </div>

          <div className="success-right">
            {/* Customer Information */}
            <div className="customer-info">
              <h3>ข้อมูลลูกค้า</h3>
              <div className="customer-details">
                <p><strong>ชื่อ:</strong> {orderData.customerName}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {orderData.customerPhone}</p>
                <p><strong>อีเมล:</strong> {orderData.customerEmail}</p>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="delivery-info">
              <h3>ข้อมูลการจัดส่ง</h3>
              <div className="delivery-details">
                <p><strong>วิธีการจัดส่ง:</strong> {orderData.deliveryMethod === 'pickup' ? 'รับที่ร้าน' : 'จัดส่งที่บ้าน'}</p>
                
                {orderData.deliveryMethod === 'pickup' && orderData.pickupAddress && (
                  <div>
                    <p><strong>ที่อยู่รับสินค้า:</strong></p>
                    <p>{orderData.pickupAddress.companyName}</p>
                    <p>{orderData.pickupAddress.address}</p>
                    <p>โทร: {orderData.pickupAddress.phone}</p>
                    <p>วันทำการ: {orderData.pickupAddress.workingHours}</p>
                  </div>
                )}

                {orderData.deliveryMethod === 'delivery' && orderData.deliveryAddress && (
                  <div>
                    <p><strong>ที่อยู่จัดส่ง:</strong></p>
                    <p>{orderData.deliveryAddress.companyName}</p>
                    <p>{orderData.deliveryAddress.address}</p>
                    {(orderData.deliveryAddress.district || orderData.deliveryAddress.amphoe || orderData.deliveryAddress.province) && (
                      <p>{[orderData.deliveryAddress.district, orderData.deliveryAddress.amphoe, orderData.deliveryAddress.province].filter(Boolean).join(' ')}</p>
                    )}
                    {orderData.deliveryAddress.postalCode && (
                      <p>รหัสไปรษณีย์: {orderData.deliveryAddress.postalCode}</p>
                    )}
                    <p>โทร: {orderData.deliveryAddress.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Information */}
            {orderData.needInvoice && orderData.invoiceData && (
              <div className="invoice-info">
                <h3>ข้อมูลใบกำกับภาษี</h3>
                <div className="invoice-details">
                  <p><strong>ชื่อบริษัท/บุคคล:</strong> {orderData.invoiceData.companyName}</p>
                  <p><strong>ชื่อผู้ติดต่อ:</strong> {orderData.invoiceData.contactName}</p>
                  <p><strong>ที่อยู่:</strong> {orderData.invoiceData.address}</p>
                  <p><strong>เบอร์โทรศัพท์:</strong> {orderData.invoiceData.phone}</p>
                </div>
              </div>
            )}

            {/* Document Download Buttons */}
            <div className="document-download">
              <h3>เอกสารการสั่งซื้อ</h3>
              <div className="download-buttons">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleDownloadReceipt}
                >
                  <i className="fas fa-file-download"></i> พิมพ์ใบกำกับภาษี
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={handleBackToHome}
              >
                <i className="fas fa-home"></i> กลับไปหน้าแรก
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleViewOrders}
              >
                <i className="fas fa-list"></i> ดูคำสั่งซื้อ
              </button>
            </div>
          </div>
      </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;