import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nickname: '',
    gender: ''
  });
  const [addressData, setAddressData] = useState({
    address: '',
    district: '',
    province: '',
    postalCode: ''
  });
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const hasToken = !!localStorage.getItem('token');

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
        province: 'ไม่ระบุ',
        postalCode: 'ไม่ระบุ'
      });
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
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
            province: response.data.province || '',
            postalCode: response.data.postalCode || ''
          });
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
          province: 'ไม่ระบุ',
          postalCode: 'ไม่ระบุ'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [hasToken]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    setAddressData({
      ...addressData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated data to the server
    setUser({ ...user, ...formData });
    setIsEditing(false);
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/favorites', {
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
      const response = await axios.get('http://localhost:5000/api/orders', {
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
    }
  }, [activeTab]);

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
                      onChange={handleInputChange}
                      required
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
                    />
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
                  <label>จังหวัด</label>
                  <input
                    type="text"
                    name="province"
                    value={addressData.province}
                    onChange={handleAddressChange}
                    placeholder="จังหวัด"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={addressData.postalCode}
                    onChange={handleAddressChange}
                    placeholder="รหัสไปรษณีย์"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-save">บันทึกที่อยู่</button>
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
        return (
          <div className="content-section">
            <h2>รายการโปรด</h2>
            <div className="favorites-list">
              {favorites.length > 0 ? (
                favorites.map((favorite, index) => (
                  <div key={index} className="favorite-item">
                    <div className="product-info">
                      <h4>{favorite.product?.name}</h4>
                      <p>ราคา: ฿{favorite.product?.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>ยังไม่มีรายการโปรด</p>
                  <p>กดหัวใจในสินค้าที่ชอบเพื่อเพิ่มในรายการโปรด</p>
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