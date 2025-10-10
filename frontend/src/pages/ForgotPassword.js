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
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
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
            <div className="logo-box">K</div>
            <div className="brand-text">
              <div className="brand-line">Furniture</div>
              <div className="brand-line secondary">KaoKai</div>
            </div>
          </div>
        </div>
        <div className="forgot-password-right">
          <h1>ลืมรหัสผ่าน</h1>
          <p className="forgot-password-description">
            กรุณากรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
          </p>
          
          <form onSubmit={onSubmit} className="forgot-password-form">
            <label>อีเมล์ผู้ใช้งาน</label>
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
              {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
            
            <div className="back-to-login">
              <a href="/login">กลับไปหน้าเข้าสู่ระบบ</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
