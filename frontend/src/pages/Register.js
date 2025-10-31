import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import './Register.css';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [accept, setAccept]       = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accept) {
      setError('กรุณายอมรับเงื่อนไขการใช้งาน');
      return;
    }
    if (password.length < 8) {
      setError('รหัสผ่านอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (password !== confirm) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res  = await axios.post(getApiUrl('api/auth/register'), {
        name, email, password, phone
      });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/profile';
    } catch (err) {
      setError(err?.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* LEFT: big logo image */}
        <div className="register-left">
          {/* ถ้าไฟล์อยู่ใน public ใช้ path แบบนี้ได้เลย */}
          <img
            className="logo-login"
            src="/images/logo-login-kaokai.png"
            alt="Kaokai Furniture"
          />
        </div>

        {/* RIGHT: form */}
        <div className="register-right">
          <h1>สมัครสมาชิก</h1>
          <form onSubmit={onSubmit} className="register-form">
            <label>ชื่อ - นามสกุล</label>
            <div className="name-row">
              <input
                type="text"
                placeholder="ชื่อ"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="นามสกุล"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <label>อีเมล์ผู้ใช้งาน</label>
            <input
              type="email"
              placeholder="อีเมล์ผู้ใช้งาน"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>เบอร์มือถือ</label>
            <input
              type="tel"
              placeholder="หมายเลขโทรศัพท์"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label>รหัสผ่าน</label>
            <input
              type="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <div className="terms">
              <label>
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                />
                <span>
                  {' '}
                  ฉันได้อ่านและยอมรับ เงื่อนไขการใช้บริการ และ นโยบายความเป็นส่วนตัว
                </span>
              </label>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn-register" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>

            <div className="login-note">
              หากคุณมีบัญชีอยู่แล้ว สามารถ <Link to="/login">เข้าสู่ระบบ</Link> ได้ที่นี่
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
