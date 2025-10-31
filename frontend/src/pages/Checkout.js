import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // ข้อมูลการจัดส่ง
  const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' หรือ 'delivery'
  const [pickupAddress] = useState({
    companyName: 'อาร์ดีเอ็น (ประเทศไทย) จำกัด',
    address: '99/5 หมู่ที่ 5 ตำบลไทรน้อย อำเภอไทรน้อย จังหวัดนนทบุรี 11150',
    phone: '092-7605-230',
    workingHours: 'ทุกวัน 08:00-19:00 น.'
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    companyName: '',
    contactName: '',
    address: '',
    district: '',
    amphoe: '',
    province: '',
    postalCode: '',
    phone: ''
  });

  // ข้อมูลใบกำกับภาษี
  const [needInvoice, setNeedInvoice] = useState(true);
  const [invoiceData, setInvoiceData] = useState({
    companyName: 'อนุบาลหมีน้อย',
    contactName: 'เดวิด เบ็คแฮม',
    address: '29/89 หมู่ที่ 2 โครงการอรุณสุกรี ตำบลลำโพ อำเภอบางบัวทอง จังหวัดนนทบุรี 11110',
    phone: '029-334-7721'
  });

  // ข้อมูลคำสั่งซื้อ
  const [orderNumber, setOrderNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  // รูปสินค้า
  const getProductImage = (product) => {
    if (product.model) return `/images/products/${product.model}.jpg`;
    return '';
  };

  const fetchCartItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบก่อน');
        setLoading(false);
        return;
      }
      const response = await axios.get(getApiUrl('api/cart'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setCartItems(response.data);
        calculateTotal(response.data);
      } else {
        setError('ไม่มีสินค้าในตะกร้า กรุณาเพิ่มสินค้าก่อน');
      }
    } catch (err) {
      console.error('Error fetching cart items:', err);
      if (err.response?.status === 401) setError('กรุณาเข้าสู่ระบบก่อน');
      else setError('ไม่สามารถโหลดข้อมูลตะกร้าได้');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(getApiUrl('api/user'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);

        setInvoiceData({
          companyName: response.data.name || 'อนุบาลหมีน้อย',
          contactName: response.data.name || 'เดวิด เบ็คแฮม',
          address: response.data.address || '29/89 หมู่ที่ 2 โครงการอรุณสุกรี ตำบลลำโพ อำเภอบางบัวทอง จังหวัดนนทบุรี 11110',
          phone: response.data.phone || '029-334-7721'
        });

        setDeliveryAddress({
          companyName: response.data.name || '',
          contactName: response.data.name || '',
          address: response.data.address || '',
          district: response.data.district || '',
          amphoe: response.data.amphoe || '',
          province: response.data.province || '',
          postalCode: response.data.postalCode || '',
          phone: response.data.phone || ''
        });
      } else {
        // ค่า default
        setUser({ name: 'เดวิด เบ็คแฮม', phone: '0293347721', email: 'david.b@gmail.com' });
        setDeliveryAddress({
          companyName: 'เดวิด เบ็คแฮม',
          contactName: 'เดวิด เบ็คแฮม',
          address: '29/89 หมู่ที่ 2 โครงการอรุณสุกรี',
          district: 'ลำโพ',
          amphoe: 'บางบัวทอง',
          province: 'นนทบุรี',
          postalCode: '11110',
          phone: '0293347721'
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUser({ name: 'เดวิด เบ็คแฮม', phone: '0293347721', email: 'david.b@gmail.com' });
      setDeliveryAddress({
        companyName: 'เดวิด เบ็คแฮม',
        contactName: 'เดวิด เบ็คแฮม',
        address: '29/89 หมู่ที่ 2 โครงการอรุณสุกรี',
        district: 'ลำโพ',
        amphoe: 'บางบัวทอง',
        province: 'นนทบุรี',
        postalCode: '11110',
        phone: '0293347721'
      });
    }
  }, []);

  const generateOrderNumber = useCallback(() => {
    const orderNum = Math.floor(Math.random() * 9000000000) + 1000000000;
    setOrderNumber(orderNum.toString());
  }, []);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setTotalAmount(total);
  };

  useEffect(() => {
    fetchCartItems();
    fetchUserData();
    generateOrderNumber();
  }, [fetchCartItems, fetchUserData, generateOrderNumber]);

  const handleDeliveryMethodChange = (method) => setDeliveryMethod(method);
  const handleInvoiceChange = (need) => setNeedInvoice(need);

  const handleInvoiceDataChange = (field, value) =>
    setInvoiceData(prev => ({ ...prev, [field]: value }));

  const handleDeliveryAddressChange = (field, value) =>
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));

  const handleProceedToPayment = async () => {
    try {
      navigate('/payment', {
        state: {
          orderData: {
            orderNumber,
            deliveryMethod,
            pickupAddress: deliveryMethod === 'pickup' ? pickupAddress : null,
            deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : null,
            needInvoice,
            invoiceData: needInvoice ? invoiceData : null,
            items: cartItems,
            totalAmount,
            customerName: user?.name,
            customerEmail: user?.email,
            customerPhone: user?.phone
          }
        }
      });
    } catch (err) {
      console.error('Error proceeding to payment:', err);
      alert('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading-container">
            <i className="fas fa-spinner fa-spin"></i>
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/cart')} className="btn btn-primary">กลับไปตะกร้า</button>
              <button onClick={() => navigate('/products')} className="btn btn-secondary">ดูสินค้า</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>การจัดส่ง</h1>
        </div>

        <div className="checkout-content">
          <div className="checkout-left">
            {/* ขั้นตอน */}
            <div className="progress-steps">
              <div className="step active">
                <i className="fas fa-shipping-fast"></i>
                <span>การจัดส่ง</span>
              </div>
              <div className="step">
                <i className="fas fa-credit-card"></i>
                <span>การชำระเงิน</span>
              </div>
              <div className="step">
                <i className="fas fa-check"></i>
                <span>เสร็จสิ้น</span>
              </div>
            </div>

            {/* === ใหม่: 2 บล็อกซ้าย-ขวา === */}
            <div className="left-grid">
              {/* บล็อก เลือกวิธีจัดส่ง */}
              <div className="card-block">
                <h2>เลือกวิธีจัดส่ง</h2>

                <div className="pill-buttons">
                  <button
                    className={`pill-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('pickup')}
                  >
                    รับที่ร้าน
                  </button>
                  <button
                    className={`pill-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                    onClick={() => handleDeliveryMethodChange('delivery')}
                  >
                    จัดส่งที่บ้าน
                  </button>
                </div>

                {deliveryMethod === 'pickup' && (
                  <div className="pickup-address">
                    <h4>ที่อยู่รับสินค้า</h4>
                    <div className="address-info">
                      <p><strong>ชื่อบริษัท:</strong> {pickupAddress.companyName}</p>
                      <p><strong>ที่อยู่:</strong> {pickupAddress.address}</p>
                      <p><strong>เบอร์โทรศัพท์:</strong> {pickupAddress.phone}</p>
                      <p><strong>วันทำการ:</strong> {pickupAddress.workingHours}</p>
                    </div>
                  </div>
                )}

                {deliveryMethod === 'delivery' && (
                  <div className="delivery-address">
                    <h4>ที่อยู่จัดส่ง</h4>
                    <div className="auto-fill-notice">
                      <i className="fas fa-info-circle"></i>
                      <span>ข้อมูลถูกดึงมาจากโปรไฟล์ของคุณแล้ว สามารถแก้ไขได้ตามต้องการ</span>
                    </div>

                    <div className="form-group">
                      <label>ชื่อบริษัท/บุคคล:</label>
                      <input
                        type="text"
                        value={deliveryAddress.companyName}
                        onChange={(e) => handleDeliveryAddressChange('companyName', e.target.value)}
                        placeholder="กรุณากรอกชื่อบริษัทหรือบุคคล"
                      />
                    </div>

                    <div className="form-group">
                      <label>ชื่อผู้ติดต่อ:</label>
                      <input
                        type="text"
                        value={deliveryAddress.contactName}
                        onChange={(e) => handleDeliveryAddressChange('contactName', e.target.value)}
                        placeholder="กรุณากรอกชื่อผู้ติดต่อ"
                      />
                    </div>

                    <div className="form-group">
                      <label>ที่อยู่:</label>
                      <textarea
                        rows="3"
                        value={deliveryAddress.address}
                        onChange={(e) => handleDeliveryAddressChange('address', e.target.value)}
                        placeholder="กรุณากรอกที่อยู่จัดส่ง"
                      />
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label>ตำบล/แขวง:</label>
                        <input
                          type="text"
                          value={deliveryAddress.district}
                          onChange={(e) => handleDeliveryAddressChange('district', e.target.value)}
                          placeholder="ตำบล/แขวง"
                        />
                      </div>
                      <div className="form-group">
                        <label>อำเภอ/เขต:</label>
                        <input
                          type="text"
                          value={deliveryAddress.amphoe}
                          onChange={(e) => handleDeliveryAddressChange('amphoe', e.target.value)}
                          placeholder="อำเภอ/เขต"
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label>จังหวัด:</label>
                        <input
                          type="text"
                          value={deliveryAddress.province}
                          onChange={(e) => handleDeliveryAddressChange('province', e.target.value)}
                          placeholder="จังหวัด"
                        />
                      </div>
                      <div className="form-group">
                        <label>รหัสไปรษณีย์:</label>
                        <input
                          type="text"
                          maxLength="5"
                          value={deliveryAddress.postalCode}
                          onChange={(e) => handleDeliveryAddressChange('postalCode', e.target.value)}
                          placeholder="รหัสไปรษณีย์"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>เบอร์โทรศัพท์:</label>
                      <input
                        type="tel"
                        value={deliveryAddress.phone}
                        onChange={(e) => handleDeliveryAddressChange('phone', e.target.value)}
                        placeholder="กรุณากรอกเบอร์โทรศัพท์"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* บล็อก ใบกำกับภาษี */}
              <div className="card-block">
                <h2>ใบกำกับภาษี</h2>

                <div className="pill-buttons">
                  <button
                    className={`pill-btn ${needInvoice ? 'active' : ''}`}
                    onClick={() => handleInvoiceChange(true)}
                  >
                    ต้องการใบกำกับภาษี
                  </button>
                  <button
                    className={`pill-btn ${!needInvoice ? 'active' : ''}`}
                    onClick={() => handleInvoiceChange(false)}
                  >
                    ไม่ต้องการใบกำกับภาษี
                  </button>
                </div>

                {needInvoice && (
                  <>
                    {/* โหมดสรุปให้เหมือนภาพ */}
                    <div className="invoice-summary">
                      <p className="inv-title">{invoiceData.companyName || '-'}</p>
                      <p>{invoiceData.contactName || '-'}</p>
                      <p>{invoiceData.address || '-'}</p>
                      <p>เบอร์โทรศัพท์ {invoiceData.phone || '-'}</p>
                      <div className="download-link">
                        <button type="button" className="download-btn">Download</button>
                      </div>
                    </div>

                    {/* ถ้าต้องการเปิดแก้ไขแบบฟอร์ม: */}
                    {/* <details className="edit-toggle"><summary>แก้ไขข้อมูล</summary> ...ฟอร์ม... </details> */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ขวา: ข้อมูลลูกค้า + สรุปคำสั่งซื้อ */}
          <div className="checkout-right">
            <div className="customer-info">
              <h3>ข้อมูลลูกค้า</h3>
              <div className="customer-details">
                <p><strong>ชื่อ:</strong> {user?.name || 'ไม่ระบุ'}</p>
                <p><strong>เบอร์โทรศัพท์:</strong> {user?.phone || 'ไม่ระบุ'}</p>
                <p><strong>อีเมล:</strong> {user?.email || 'ไม่ระบุ'}</p>
              </div>
            </div>

            <div className="order-summary">
              <h3>คำสั่งซื้อ เลขที่ {orderNumber}</h3>
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-image">
                      {(getProductImage(item.product) || '/images/NoImage.png') && (
                        <img
                          src={getProductImage(item.product) || '/images/NoImage.png'}
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
                <p><strong>ยอดรวม: {totalAmount.toLocaleString()} บาท</strong></p>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-actions">
          <button className="btn btn-primary payment-btn" onClick={handleProceedToPayment}>
            ชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
