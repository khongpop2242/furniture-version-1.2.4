import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5050/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-left">
          <div className="brand-logo">
    {/* ใช้โลโก้จาก public/images */}
    <img
      className="photo-left"
      src="/images/logo-login-kaokai.png"
      alt="KaoKai Furniture"
      loading="eager"
      decoding="async"
    />
  </div>
        </div>
        <div className="forgot-password-right">
          <h1>ลืมรหัสผ่าน</h1>
          
          <form onSubmit={onSubmit} className="forgot-password-form">
            <label>กรอกอีเมล์ที่ลงทะเบียนไว้</label>
            <input 
              type="email" 
              placeholder="อีเมล์ผู้ใช้งาน" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            
            <button className="btn-forgot-password" type="submit" disabled={loading}>
              {loading ? 'กำลังส่ง...' : 'ดำเนินการต่อ'}
            </button>
            
            <div className="back-to-login">
  <span className="back-label">กลับไปยังหน้า</span>
  <a className="back-link" href="/login">เข้าสู่ระบบ</a>
</div>

          </form>
        </div>
      </div>
    </div>
  );
}
