import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResetPassword.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง');
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { 
        token, 
        password 
      });
      setMessage(res.data.message);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return <div className="reset-password-page">กำลังโหลด...</div>;
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-left">
          <div className="brand-logo">
            <div className="logo-box">K</div>
            <div className="brand-text">
              <div className="brand-line">Furniture</div>
              <div className="brand-line secondary">KaoKai</div>
            </div>
          </div>
        </div>
        <div className="reset-password-right">
          <h1>รีเซ็ตรหัสผ่าน</h1>
          <p className="reset-password-description">
            กรุณากรอกรหัสผ่านใหม่ของคุณ
          </p>
          
          <form onSubmit={onSubmit} className="reset-password-form">
            <label>รหัสผ่านใหม่</label>
            <input 
              type="password" 
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            
            <label>ยืนยันรหัสผ่าน</label>
            <input 
              type="password" 
              placeholder="ยืนยันรหัสผ่านใหม่" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            
            <button className="btn-reset-password" type="submit" disabled={loading}>
              {loading ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน'}
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
