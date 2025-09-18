import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/profile';
    } catch (err) {
      setError(err?.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand-logo">
            <div className="logo-box">K</div>
            <div className="brand-text">
              <div className="brand-line">Furniture</div>
              <div className="brand-line secondary">KaoKai</div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <h1>เข้าสู่ระบบ</h1>
          <form onSubmit={onSubmit} className="login-form">
            <label>อีเมล์ผู้ใช้งาน</label>
            <input type="email" placeholder="อีเมล์ผู้ใช้งาน" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <label>รหัสผ่าน</label>
            <input type="password" placeholder="ระบุรหัสผ่าน ( อย่างน้อย8ตัวอักษร )" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            <div className="login-utils">
              <button type="button" onClick={()=>alert('ยังไม่เปิดใช้ฟีเจอร์ลืมรหัสผ่าน')}>ลืมรหัสผ่าน?</button>
            </div>
            {error && <div className="error">{error}</div>}
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
            <div className="signup-note">
              หากคุณยังไม่มีบัญชีสามารถ <a href="/register">สมัครสมาชิก</a> ได้ที่นี่
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


