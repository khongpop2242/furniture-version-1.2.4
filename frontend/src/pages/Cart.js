import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null); // { paymentIntentId, qrPng, status }
  const [paymentStatus, setPaymentStatus] = useState('requires_payment_method');
  const [pollTimer, setPollTimer] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cart');
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        await axios.delete(`http://localhost:5000/api/cart/${productId}`);
      } else {
        await axios.put(`http://localhost:5000/api/cart/${productId}`, { quantity: newQuantity });
      }
      const response = await axios.get('http://localhost:5000/api/cart');
      setCartItems(response.data);
    } catch (e) {
      console.error('Error updating cart quantity:', e);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${productId}`);
      const response = await axios.get('http://localhost:5000/api/cart');
      setCartItems(response.data);
    } catch (e) {
      console.error('Error removing item from cart:', e);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const printQuotation = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('th-TH');
    const quotationNumber = 'QT-' + Date.now().toString().slice(-6);
    
    const quotationHTML = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ใบเสนอราคา - ${quotationNumber}</title>
        <style>
          body {
            font-family: 'Sarabun', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .quotation-header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .quotation-title {
            font-size: 20px;
            color: #34495e;
            margin-bottom: 10px;
          }
          .quotation-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-section {
            flex: 1;
          }
          .info-section h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 16px;
          }
          .info-section p {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
          }
          .total-section {
            text-align: right;
            margin-top: 20px;
          }
          .total-row {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            padding: 10px 0;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #e74c3c;
            border-top: 2px solid #2c3e50;
            padding-top: 10px;
          }
          .terms {
            margin-top: 40px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .terms h3 {
            color: #2c3e50;
            margin-bottom: 10px;
          }
          .terms ul {
            margin: 0;
            padding-left: 20px;
          }
          .terms li {
            margin-bottom: 5px;
            font-size: 14px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="quotation-header">
          <div class="company-name">บริษัท เฟอร์นิเจอร์ออฟฟิศ จำกัด</div>
          <div class="quotation-title">ใบเสนอราคา (Quotation)</div>
        </div>
        
        <div class="quotation-info">
          <div class="info-section">
            <h3>ข้อมูลบริษัท</h3>
            <p>ที่อยู่: 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</p>
            <p>โทร: 02-123-4567</p>
            <p>อีเมล: info@furniture-office.com</p>
          </div>
          <div class="info-section">
            <h3>ข้อมูลใบเสนอราคา</h3>
            <p><strong>เลขที่:</strong> ${quotationNumber}</p>
            <p><strong>วันที่:</strong> ${currentDate}</p>
            <p><strong>วันหมดอายุ:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รายการสินค้า</th>
              <th>รุ่น</th>
              <th>จำนวน</th>
              <th>ราคาต่อหน่วย</th>
              <th>ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.model || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} บาท</td>
                <td>${(item.price * item.quantity).toLocaleString()} บาท</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>ราคารวมสินค้า:</span>
            <span style="margin-left: 20px;">${calculateTotal().toLocaleString()} บาท</span>
          </div>
          <div class="total-row">
            <span>ค่าจัดส่ง:</span>
            <span style="margin-left: 20px;">ฟรี</span>
          </div>
          <div class="grand-total">
            <span>ยอดรวมทั้งหมด:</span>
            <span style="margin-left: 20px;">${calculateTotal().toLocaleString()} บาท</span>
          </div>
        </div>
        
        <div class="terms">
          <h3>เงื่อนไขและข้อกำหนด</h3>
          <ul>
            <li>ใบเสนอราคานี้มีอายุ 30 วัน นับจากวันที่ออกใบเสนอราคา</li>
            <li>ราคาดังกล่าวรวมภาษีมูลค่าเพิ่ม 7% แล้ว</li>
            <li>ระยะเวลาจัดส่ง 7-14 วันทำการ หลังจากยืนยันคำสั่งซื้อ</li>
            <li>การชำระเงิน: ชำระเงิน 50% เมื่อสั่งซื้อ และชำระส่วนที่เหลือก่อนจัดส่ง</li>
            <li>การรับประกัน: รับประกันสินค้า 1 ปี สำหรับชิ้นส่วนที่ผลิตจากโรงงาน</li>
          </ul>
        </div>
        
        <div style="margin-top: 50px; text-align: center;">
          <p>ขอบคุณที่ให้ความไว้วางใจ</p>
          <p style="margin-top: 30px;">ลงชื่อผู้เสนอราคา: _________________</p>
          <p>วันที่: ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(quotationHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // รอให้เนื้อหาถูกโหลดก่อนพิมพ์
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ---------- PromptPay Payment ----------
  const extractQrFromNextAction = (nextAction) => {
    if (!nextAction) return null;
    // รองรับหลายรูปแบบของ Stripe next_action สำหรับ PromptPay
    // 1) next_action.promptpay_display_qr_code.image_url_png/svg
    const pqr = nextAction.promptpay_display_qr_code;
    if (pqr?.image_url_png) return { type: 'url', value: pqr.image_url_png };
    if (pqr?.image_url_svg) return { type: 'url', value: pqr.image_url_svg };
    // 2) next_action.display_qr_code?.image_url_png/svg (fallback ชื่อ generic)
    const gqr = nextAction.display_qr_code;
    if (gqr?.image_url_png) return { type: 'url', value: gqr.image_url_png };
    if (gqr?.image_url_svg) return { type: 'url', value: gqr.image_url_svg };
    // 3) ถ้ามี data ในรูปแบบ base64
    if (pqr?.image_data_url) return { type: 'data', value: pqr.image_data_url };
    if (gqr?.image_data_url) return { type: 'data', value: gqr.image_data_url };
    return null;
  };

  const openPaymentModal = (info) => {
    setPaymentInfo(info);
    setPaymentStatus(info?.status || 'processing');
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPaymentInfo(null);
    if (pollTimer) {
      clearInterval(pollTimer);
      setPollTimer(null);
    }
  };

  const startPollingStatus = (paymentIntentId) => {
    if (pollTimer) clearInterval(pollTimer);
    const timer = setInterval(async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/payments/${paymentIntentId}/status`);
        setPaymentStatus(data.status);
        if (data.status === 'succeeded' || data.status === 'canceled' || data.status === 'requires_payment_method') {
          clearInterval(timer);
          setPollTimer(null);
        }
      } catch (e) {
        // หยุดถ้าผิดพลาดหลายครั้ง
        clearInterval(timer);
        setPollTimer(null);
      }
    }, 3000);
    setPollTimer(timer);
  };

  const handlePromptPayCheckout = async () => {
    // ตรวจสอบการล็อกอินก่อนดำเนินการจ่ายเงิน
    const token = localStorage.getItem('token');
    if (!token) {
      const confirmLogin = window.confirm('กรุณาเข้าสู่ระบบก่อนดำเนินการจ่ายเงิน\nต้องการไปหน้าเข้าสู่ระบบหรือไม่?');
      if (confirmLogin) {
        window.location.href = '/login';
      }
      return;
    }

    try {
      if (cartItems.length === 0) return;
      setCreatingPayment(true);
      const amountSatang = Math.round(calculateTotal() * 100);
      // ใช้ Stripe Checkout (Hosted) สำหรับหน้าตามรูป
      const { data } = await axios.post('http://localhost:5000/api/checkout/create', {
        amount: amountSatang,
        email: 'customer@example.com'
      });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      // fallback เดิมกรณีไม่มี url
      const paymentCreate = await axios.post('http://localhost:5000/api/payments/create', {
        amount: amountSatang,
        currency: 'thb',
        description: 'Cart checkout',
        email: 'customer@example.com',
        name: 'Cart Customer',
      });
      const qr = extractQrFromNextAction(paymentCreate.data.nextAction);
      const qrSrc = qr ? qr.value : null;
      const info = {
        paymentIntentId: paymentCreate.data.paymentIntentId,
        qrSrc,
        status: paymentCreate.data.status,
      };
      openPaymentModal(info);
      startPollingStatus(paymentCreate.data.paymentIntentId);
    } catch (error) {
      console.error('Create PromptPay payment error:', error);
      const apiMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'ไม่ทราบสาเหตุ';
      alert(`ไม่สามารถสร้างการชำระเงินได้:\n${apiMsg}`);
    } finally {
      setCreatingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>ตะกร้าสินค้า</h1>
          <div className="loading">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>ตะกร้าสินค้า</h1>
          <div className="empty-cart">
            <i className="fas fa-shopping-cart"></i>
            <h2>ตะกร้าสินค้าว่าง</h2>
            <p>คุณยังไม่มีสินค้าในตะกร้า</p>
            <a href="/products" className="btn btn-primary">ไปเลือกสินค้า</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>ตะกร้าสินค้า</h1>
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price.toLocaleString()} บาท</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">
                  {(item.price * item.quantity).toLocaleString()} บาท
                </div>
                <button 
                  className="remove-item"
                  onClick={() => removeItem(item.id)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>สรุปคำสั่งซื้อ</h2>
            <div className="summary-item">
              <span>จำนวนสินค้า:</span>
              <span>{getTotalItems()} ชิ้น</span>
            </div>
            <div className="summary-item">
              <span>ราคารวม:</span>
              <span>{calculateTotal().toLocaleString()} บาท</span>
            </div>
            <div className="summary-item">
              <span>ค่าจัดส่ง:</span>
              <span>ฟรี</span>
            </div>
            <div className="summary-total">
              <span>ยอดรวมทั้งหมด:</span>
              <span>{calculateTotal().toLocaleString()} บาท</span>
            </div>
            <div className="cart-actions">
              {!localStorage.getItem('token') && (
                <div className="login-required-notice">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>กรุณาเข้าสู่ระบบก่อนดำเนินการจ่ายเงิน</span>
                </div>
              )}
              <button 
                className={`btn btn-primary checkout-btn ${!localStorage.getItem('token') ? 'disabled' : ''}`} 
                onClick={handlePromptPayCheckout} 
                disabled={creatingPayment}
                title={!localStorage.getItem('token') ? 'กรุณาเข้าสู่ระบบก่อน' : ''}
              >
                {creatingPayment ? 'กำลังสร้างการชำระเงิน...' : 'ชำระเงินด้วย PromptPay'}
              </button>
              <button 
                className="btn btn-secondary print-quotation-btn"
                onClick={printQuotation}
              >
                <i className="fas fa-print"></i> พิมพ์ใบเสนอราคา
              </button>
            </div>
          </div>
        </div>
      </div>

      {paymentModalOpen && (
        <div className="payment-modal">
          <div className="payment-modal__content">
            <button className="payment-modal__close" onClick={closePaymentModal}>×</button>
            <h3>ชำระเงินด้วย PromptPay</h3>
            {paymentInfo?.qrSrc ? (
              <div className="payment-modal__qr">
                <img src={paymentInfo.qrSrc} alt="PromptPay QR" />
              </div>
            ) : (
              <div className="payment-modal__loading">กำลังเตรียม QR...</div>
            )}
            <div className={`payment-status status-${paymentStatus}`}>
              สถานะ: {paymentStatus}
            </div>
            <div className="payment-hint">สแกน QR ด้วยแอปธนาคารของคุณ</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 