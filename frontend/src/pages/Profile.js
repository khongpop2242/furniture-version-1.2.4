import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import Login from './Login';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const hasToken = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  useEffect(() => {
    if (!hasToken) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the updated data to the server
    setUser({ ...user, ...formData });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <h1>โปรไฟล์</h1>
          <div className="loading">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  // ยังไม่ล็อกอิน: แสดงหน้าเข้าสู่ระบบภายในหน้าโปรไฟล์
  if (!hasToken) {
    return (
      <div className="profile-page">
        <div className="container">
          <h1>โปรไฟล์</h1>
          <Login />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>โปรไฟล์</h1>
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'ยกเลิก' : 'แก้ไข'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleLogout}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="profile-details">
            <h3>ข้อมูลส่วนตัว</h3>
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>ชื่อ</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>อีเมล์</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>ที่อยู่</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </form>
            ) : (
              <div className="profile-info-display">
                <div className="info-item">
                  <span className="label">ชื่อ:</span>
                  <span className="value">{formData.name}</span>
                </div>
                <div className="info-item">
                  <span className="label">อีเมล์:</span>
                  <span className="value">{formData.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">เบอร์โทรศัพท์:</span>
                  <span className="value">{formData.phone || 'ไม่ระบุ'}</span>
                </div>
                <div className="info-item">
                  <span className="label">ที่อยู่:</span>
                  <span className="value">{formData.address || 'ไม่ระบุ'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="profile-actions">
            <h3>การตั้งค่า</h3>
            <div className="action-buttons">
              <button className="btn btn-secondary">
                <i className="fas fa-key"></i>
                เปลี่ยนรหัสผ่าน
              </button>
              <button className="btn btn-secondary">
                <i className="fas fa-bell"></i>
                การแจ้งเตือน
              </button>
              <button className="btn btn-secondary">
                <i className="fas fa-cog"></i>
                การตั้งค่าทั่วไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 