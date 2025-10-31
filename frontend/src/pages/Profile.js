import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    nickname: '',
    gender: '',
  });
  
  const [addressData, setAddressData] = useState({
    address: '',
    district: '',
    amphoe: '', // เพิ่ม
    province: '',
    postalCode: ''
  });
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const hasToken = !!localStorage.getItem('token');

  // ข้อมูลจังหวัดทั้ง 77 จังหวัดของประเทศไทย
  const provinces = [
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา',
    'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
    'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
    'นางรอง', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา',
    'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม',
    'มุกดาหาร', 'แม่ฮ่องสอน', 'ยะลา', 'ยโสธร', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง',
    'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร',
    'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
    'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  useEffect(() => {
    if (!hasToken) {
      // แสดงข้อมูล mock ทันทีเมื่อไม่มี token
      const mockUser = {
        id: 1,
        name: 'ก้องภพ สัตบุษ',
        email: 'david.b@gmail.com',
        phone: 'ไม่ระบุ',
        address: 'ไม่ระบุ',
        nickname: 'ไม่ระบุ',
        gender: 'ไม่ระบุ',
        district: 'ไม่ระบุ',
        province: 'ไม่ระบุ',
        postalCode: 'ไม่ระบุ'
      };
      setUser(mockUser);
      setFormData({
        firstName: 'เดวิด',
        lastName: 'เบ็คแฮม',
        email: 'david.b@gmail.com',
        phone: '0802291345',
        nickname: '',
        gender: 'ชาย'
      });
      setAddressData({
        address: 'ไม่ระบุ',
        district: 'ไม่ระบุ',
        amphoe: '',
        province: 'ไม่ระบุ',
        postalCode: 'ไม่ระบุ'
      });
      setProvinceSearch('ไม่ระบุ');
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(getApiUrl('api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000 // ตั้ง timeout 3 วินาที
        });
        
        if (response.data) {
          setUser(response.data);
          const nameParts = (response.data.name || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            nickname: response.data.nickname || '',
            gender: response.data.gender || ''
          });
          setAddressData({
            address: response.data.address || '',
            district: response.data.district || '',
            amphoe: response.data.amphoe || '',
            province: response.data.province || '',
            postalCode: response.data.postalCode || ''
          });
          // Set provinceSearch to show the current province in the input field
          setProvinceSearch(response.data.province || '');
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // แสดงข้อมูล mock เมื่อไม่สามารถเชื่อมต่อ backend ได้
        const mockUser = {
          id: 1,
          name: 'nattapat Klu',
          email: 'test1@gmail.com',
          phone: 'ไม่ระบุ',
          address: 'ไม่ระบุ',
          nickname: 'ไม่ระบุ',
          gender: 'ไม่ระบุ',
          district: 'ไม่ระบุ',
          province: 'ไม่ระบุ',
          postalCode: 'ไม่ระบุ'
        };
        setUser(mockUser);
        setFormData({
          firstName: 'เดวิด',
          lastName: 'เบ็คแฮม',
          email: 'david.b@gmail.com',
          phone: '0802291345',
          nickname: '',
          gender: 'ชาย'
        });
        setAddressData({
          address: 'ไม่ระบุ',
          district: 'ไม่ระบุ',
          amphoe: '',
          province: 'ไม่ระบุ',
          postalCode: 'ไม่ระบุ'
        });
        setProvinceSearch('ไม่ระบุ');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [hasToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation สำหรับเบอร์โทร
    if (name === 'phone') {
      // อนุญาตเฉพาะตัวเลขและจำกัดความยาวไม่เกิน 10 ตัว
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue
      });
      
      // ตรวจสอบความถูกต้อง
      if (numericValue.length > 0 && numericValue.length !== 10) {
        setPhoneError('เบอร์โทรศัพท์ต้องมี 10 หลัก');
      } else {
        setPhoneError('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    
    // Validation สำหรับรหัสไปรษณีย์
    if (name === 'postalCode') {
      // อนุญาตเฉพาะตัวเลขและจำกัดความยาวไม่เกิน 5 ตัว
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 5);
      setAddressData({
        ...addressData,
        [name]: numericValue
      });
      
      // ตรวจสอบความถูกต้อง
      if (numericValue.length > 0 && numericValue.length !== 5) {
        setPostalCodeError('รหัสไปรษณีย์ต้องมี 5 หลัก');
      } else {
        setPostalCodeError('');
      }
    } else {
      setAddressData({
        ...addressData,
        [name]: value
      });
    }
  };

  const handleProvinceSearch = (e) => {
    setProvinceSearch(e.target.value);
    setShowProvinceDropdown(true);
  };

  const handleProvinceSelect = (province) => {
    setAddressData({
      ...addressData,
      province: province
    });
    setProvinceSearch(province);
    setShowProvinceDropdown(false);
  };

  const filteredProvinces = provinces.filter(province =>
    province.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.province-dropdown')) {
        setShowProvinceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบเบอร์โทรก่อนบันทึก
    if (formData.phone && formData.phone.length !== 10) {
      setPhoneError('เบอร์โทรศัพท์ต้องมี 10 หลัก');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.put(getApiUrl('api/user'), {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          nickname: formData.nickname,
          gender: formData.gender,
          address: addressData.address,
          district: addressData.district,
          province: addressData.province,
          postalCode: addressData.postalCode
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // อัปเดต state หลังจากบันทึกสำเร็จ
        if (response.data) {
          setUser(prevUser => ({
            ...prevUser,
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            nickname: response.data.nickname,
            gender: response.data.gender,
            address: response.data.address
          }));
          
          // อัปเดต formData เพื่อให้แสดงผลถูกต้อง
          setFormData({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            nickname: formData.nickname,
            gender: formData.gender
          });
        }
        
        alert('บันทึกข้อมูลส่วนตัวสำเร็จ');
      } else {
        // Mock save for demo
        const mockAddress = [addressData.address, addressData.district, addressData.province, addressData.postalCode]
          .filter(Boolean).join(', ');
        
        setUser(prevUser => ({
          ...prevUser,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          nickname: formData.nickname,
          gender: formData.gender,
          address: mockAddress
        }));
        
        // อัปเดต formData เพื่อให้แสดงผลถูกต้อง
        setFormData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          nickname: formData.nickname,
          gender: formData.gender
        });
        
        alert('บันทึกข้อมูลส่วนตัวสำเร็จ (Demo Mode)');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
    setIsEditing(false);
  };

  const handleSaveAddress = async () => {
    // ตรวจสอบรหัสไปรษณีย์ก่อนบันทึก
    if (addressData.postalCode && addressData.postalCode.length !== 5) {
      setPostalCodeError('รหัสไปรษณีย์ต้องมี 5 หลัก');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.put(getApiUrl('api/user'), {
          address: addressData.address,
          district: addressData.district,
          amphoe: addressData.amphoe, // ส่งไป backend
          province: addressData.province,
          postalCode: addressData.postalCode
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // อัปเดต state หลังจากบันทึกสำเร็จ
        if (response.data) {
          setUser(prevUser => ({
            ...prevUser,
            address: response.data.address,
            district: response.data.district,
            amphoe: response.data.amphoe,
            province: response.data.province,
            postalCode: response.data.postalCode
          }));
          
          // อัปเดต addressData state เพื่อให้ข้อมูลแสดงในฟอร์ม
          setAddressData({
            address: addressData.address,
            district: addressData.district,
            amphoe: addressData.amphoe,
            province: addressData.province,
            postalCode: addressData.postalCode
          });
          // อัปเดต provinceSearch เพื่อให้แสดงจังหวัดที่เลือก
          setProvinceSearch(addressData.province);
        }
        
        alert('บันทึกที่อยู่สำเร็จ');
      } else {
        // Mock save for demo
        setUser(prevUser => ({
          ...prevUser,
          address: addressData.address,
          district: addressData.district,
          amphoe: addressData.amphoe,
          province: addressData.province,
          postalCode: addressData.postalCode
        }));
        
        // อัปเดต addressData state สำหรับ demo mode
        setAddressData({
          address: addressData.address,
          district: addressData.district,
          amphoe: addressData.amphoe,
          province: addressData.province,
          postalCode: addressData.postalCode
        });
        // อัปเดต provinceSearch เพื่อให้แสดงจังหวัดที่เลือก
        setProvinceSearch(addressData.province);
        
        alert('บันทึกที่อยู่สำเร็จ (Demo Mode)');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกที่อยู่');
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/favorites'), {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // แสดงข้อมูล mock เมื่อไม่สามารถเชื่อมต่อ backend ได้
      setFavorites([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/orders'), {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // แสดงข้อมูล mock เมื่อไม่สามารถเชื่อมต่อ backend ได้
      setOrders([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchFavorites();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'personal' || activeTab === 'address') {
      // โหลดข้อมูลผู้ใช้ใหม่เมื่อเปลี่ยนไปแท็บข้อมูลส่วนตัวหรือที่อยู่
      fetchUserData();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(getApiUrl('api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000
        });
        
        if (response.data) {
          setUser(response.data);
          const nameParts = (response.data.name || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            nickname: response.data.nickname || '',
            gender: response.data.gender || ''
          });
          
          // โหลดข้อมูลที่อยู่แยกเป็นฟิลด์
          setAddressData({
            address: response.data.address || '',
            district: response.data.district || '',
            amphoe: response.data.amphoe || '',
            province: response.data.province || '',
            postalCode: response.data.postalCode || ''
          });
          // Set provinceSearch to show the current province in the input field
          setProvinceSearch(response.data.province || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="content-section">
            <h2>ข้อมูลส่วนตัว</h2>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>อีเมล์</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ชื่อ</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>นามสกุล</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>เบอร์มือถือ</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="เบอร์โทรศัพท์ 10 หลัก"
                      maxLength="10"
                      className={phoneError ? 'error' : ''}
                    />
                    {phoneError && (
                      <div className="error-message">{phoneError}</div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ชื่อเล่น</label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="ไม่บังคับ"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>เพศ</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save">บันทึก</button>
                </div>
              </form>
            ) : (
              <div className="profile-info-display">
                <div className="info-item">
                  <span className="label">อีเมล์:</span>
                  <span className="value">{formData.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">ชื่อ - นามสกุล:</span>
                  <span className="value">{`${formData.firstName} ${formData.lastName}`.trim() || 'ไม่ระบุ'}</span>
                </div>
                <div className="info-item">
                  <span className="label">เบอร์โทรศัพท์:</span>
                  <span className="value">{formData.phone || 'ไม่ระบุ'}</span>
                </div>
                <div className="info-item">
                  <span className="label">ชื่อเล่น:</span>
                  <span className="value">{formData.nickname || 'ไม่ระบุ'}</span>
                </div>
                <div className="info-item">
                  <span className="label">เพศ:</span>
                  <span className="value">{formData.gender || 'ไม่ระบุ'}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'address':
        return (
          <div className="content-section">
            <h2>ที่อยู่ของฉัน</h2>
            <form className="profile-form">
              <div className="form-row">
                <div className="form-group full-width">
                  <label>ที่อยู่</label>
                  <textarea
                    name="address"
                    value={addressData.address}
                    onChange={handleAddressChange}
                    rows="3"
                    placeholder="กรอกที่อยู่"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ตำบล/แขวง</label>
                  <input
                    type="text"
                    name="district"
                    value={addressData.district}
                    onChange={handleAddressChange}
                    placeholder="ตำบล/แขวง"
                  />
                </div>
                <div className="form-group">
                  <label>อำเภอ/เขต</label>
                  <input
                    type="text"
                    name="amphoe"
                    value={addressData.amphoe}
                    onChange={handleAddressChange}
                    placeholder="อำเภอ/เขต"
                  />
                </div>
                <div className="form-group">
                  <label>จังหวัด</label>
                  <div className="province-dropdown">
                    <input
                      type="text"
                      name="province"
                      value={provinceSearch}
                      onChange={handleProvinceSearch}
                      onFocus={() => setShowProvinceDropdown(true)}
                      placeholder="ค้นหาจังหวัด..."
                      className="province-input"
                    />
                    {showProvinceDropdown && (
                      <div className="province-dropdown-list">
                        {filteredProvinces.map((province, index) => (
                          <div
                            key={index}
                            className="province-option"
                            onClick={() => handleProvinceSelect(province)}
                          >
                            {province}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>รหัสไปรษณีย์</label>
                  <input
                    type="tel"
                    name="postalCode"
                    value={addressData.postalCode}
                    onChange={handleAddressChange}
                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                    maxLength="5"
                    className={postalCodeError ? 'error' : ''}
                  />
                  {postalCodeError && (
                    <div className="error-message">{postalCodeError}</div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-save" onClick={handleSaveAddress}>บันทึกที่อยู่</button>
              </div>
            </form>
          </div>
        );

      case 'orders':
        return (
          <div className="content-section">
            <h2>คำสั่งซื้อ</h2>
            <div className="orders-list">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="order-item">
                    <div className="order-info">
                      <h4>คำสั่งซื้อ #{order.id}</h4>
                      <p>วันที่: {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                      <p>สถานะ: {order.status}</p>
                      <p>ยอดรวม: ฿{order.total}</p>
                    </div>
                    <div className="order-actions">
                      <button 
                        className="btn-view-details"
                        onClick={() => navigate(`/order/${order.id}`)}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>ยังไม่มีคำสั่งซื้อ</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'favorites':
  // ฟังก์ชันสำหรับดึงรูปภาพจากโฟลเดอร์ public/images/products (เหมือนกับใน Products.js)
  const getProductImage = (product) => {
    if (product.model) {
      // ใช้รหัสสินค้า (model) เป็นชื่อไฟล์รูป .jpg
      return `/images/products/${product.model}.jpg`;
    }
    return '/images/NoImage.png'; // รูปภาพเริ่มต้นถ้าไม่มี model
  };

  return (
    <div className="content-section">
      <h2>รายการโปรด</h2>

      <div className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map((favorite, index) => {
            const p = favorite.product || {};
            const productId = p.id ?? p.product_id ?? favorite.product_id;

            // ใช้ฟังก์ชัน getProductImage เพื่อให้รูปตรงกับสินค้า
            const imgUrl = getProductImage(p);

            const price = Number(p.price ?? 0).toLocaleString('th-TH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });

            return (
              <div
                key={index}
                className="favorite-card"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/product/${productId}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') navigate(`/product/${productId}`);
                }}
              >
                <div className="favorite-thumb">
                  <img src={imgUrl} alt={p.name || 'product'} />
                </div>

                <div className="favorite-info">
                  <div className="favorite-title">{p.name || 'ไม่ระบุชื่อสินค้า'}</div>
                  {p.model && <div className="favorite-code">{p.model}</div>}

                  <div className="favorite-price">
                    {price} ฿ THB
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <p>ยังไม่มีรายการโปรด</p>
          </div>
        )}
      </div>
    </div>
  );


      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <h3>ก้องภพ สัตบุษ</h3>
            </div>
            
            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                ข้อมูลส่วนตัว
              </button>
              <button 
                className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
                onClick={() => setActiveTab('address')}
              >
                ที่อยู่ของฉัน
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                คำสั่งซื้อ
              </button>
              <button 
                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                รายการโปรด
              </button>
            </nav>
            
            <div className="sidebar-actions">
              {activeTab === 'personal' && (
                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              )}
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="profile-main">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // ยังไม่ล็อกอิน: แสดงหน้าโปรไฟล์ด้วยข้อมูล mock
  if (!hasToken) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <h3>ก้องภพ สัตบุษ</h3>
            </div>
            
            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                ข้อมูลส่วนตัว
              </button>
              <button 
                className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
                onClick={() => setActiveTab('address')}
              >
                ที่อยู่ของฉัน
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                คำสั่งซื้อ
              </button>
              <button 
                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                รายการโปรด
              </button>
            </nav>
            
            <div className="sidebar-actions">
              {activeTab === 'personal' && (
                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              )}
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="profile-main">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // ถ้า user เป็น null ให้แสดงหน้า Profile ด้วยข้อมูล mock
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <h3>ก้องภพ สัตบุษ</h3>
            </div>
            
            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                ข้อมูลส่วนตัว
              </button>
              <button 
                className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
                onClick={() => setActiveTab('address')}
              >
                ที่อยู่ของฉัน
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                คำสั่งซื้อ
              </button>
              <button 
                className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                รายการโปรด
              </button>
            </nav>
            
            <div className="sidebar-actions">
              {activeTab === 'personal' && (
                <button 
                  className="btn-edit"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'ยกเลิก' : 'แก้ไข'}
                </button>
              )}
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="profile-main">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <h3>{user?.name || 'ไม่ระบุชื่อ'}</h3>
          </div>
          
          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              ข้อมูลส่วนตัว
            </button>
            <button 
              className={`nav-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              ที่อยู่ของฉัน
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              คำสั่งซื้อ
            </button>
            <button 
              className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              รายการโปรด
            </button>
          </nav>
          
          <div className="sidebar-actions">
            {activeTab === 'personal' && (
              <button 
                className="btn-edit"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'ยกเลิก' : 'แก้ไข'}
              </button>
            )}
            <button 
              className="btn-logout"
              onClick={handleLogout}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        <div className="profile-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;