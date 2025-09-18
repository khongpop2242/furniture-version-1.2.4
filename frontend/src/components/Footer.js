import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">K</div>
              <span className="logo-text">KaokaiOfficeFurniture</span>
            </div>
            <div className="contact-info">
              <p><i className="fas fa-map-marker-alt"></i> ที่อยู่: 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</p>
              <p><i className="fas fa-phone"></i> เบอร์: 096-399-1916, 096-389-1916</p>
              <p><i className="fas fa-envelope"></i> อีเมล์: info@koknoioffice.com</p>
            </div>
          </div>

          <div className="footer-section">
            <h3>ช่วยเหลือ</h3>
            <ul>
              <li><Link to="/faq">คำถามที่พบบ่อย</Link></li>
              <li><Link to="/returns">การเปลี่ยนคืน เครมสินค้า</Link></li>
              <li><Link to="/tracking">ติดตามสินค้า</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>นโยบาย</h3>
            <ul>
              <li><Link to="/shipping">การส่งสินค้า</Link></li>
              <li><Link to="/privacy">เอกสารการผลิตข้อมูล</Link></li>
              <li><Link to="/terms">เงื่อนไขการใช้งาน</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>เกี่ยวกับเรา</h3>
            <ul>
              <li><Link to="/careers">สมัครงาน</Link></li>
              <li><Link to="/history">ประวัติเรา</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 KaokaiOfficeFurniture. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 