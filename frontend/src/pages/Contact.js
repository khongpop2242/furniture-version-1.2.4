import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ส่งข้อมูลไปยัง API
    console.log('ส่งข้อความ:', formData);
    alert('ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับโดยเร็วที่สุด');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="container">
        <h1>ติดต่อเรา</h1>
        
        <div className="contact-content">
          {/* ข้อมูลติดต่อ */}
          <div className="contact-info">
            <h2>📞 ข้อมูลติดต่อ</h2>
            
            <div className="contact-grid">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="contact-details">
                  <h3>📍 ที่อยู่</h3>
                  <p>123 ถนนสุขุมวิท</p>
                  <p>แขวงคลองเตย เขตคลองเตย</p>
                  <p>กรุงเทพฯ 10110</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="contact-details">
                  <h3>📱 เบอร์โทรศัพท์</h3>
                  <p><a href="tel:0963991916">096-399-1916</a></p>
                  <p><a href="tel:0963891916">096-389-1916</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="contact-details">
                  <h3>✉️ อีเมล์</h3>
                  <p><a href="mailto:info@kaokaioffice.com">info@kaokaioffice.com</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="contact-details">
                  <h3>🕒 เวลาทำการ</h3>
                  <p><strong>จันทร์ - ศุกร์:</strong> 8:00 - 18:00</p>
                  <p><strong>เสาร์:</strong> 9:00 - 16:00</p>
                  <p><strong>อาทิตย์:</strong> ปิดทำการ</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* ฟอร์มติดต่อ */}
          <div className="contact-form">
            <h2>💬 ส่งข้อความถึงเรา</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">ชื่อ *</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="กรอกชื่อของคุณ" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">อีเมล์ *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="กรอกอีเมล์ของคุณ" 
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">เบอร์โทรศัพท์</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="กรอกเบอร์โทรศัพท์" 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">หัวข้อ *</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="หัวข้อข้อความ" 
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">ข้อความ *</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5" 
                  placeholder="กรอกข้อความของคุณ..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i>
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>

        {/* ข้อมูลเพิ่มเติม */}
        <div className="contact-extra">
          <div className="extra-section">
            <h3>🚚 บริการจัดส่ง</h3>
            <p>เราจัดส่งทั่วประเทศ ปลอดภัย ตรงเวลา พร้อมบริการติดตั้ง</p>
          </div>
          
          <div className="extra-section">
            <h3>🛠️ บริการหลังการขาย</h3>
            <p>รับประกัน 1 ปี และบริการซ่อมบำรุงตลอดอายุการใช้งาน</p>
          </div>
          
          <div className="extra-section">
            <h3>💳 วิธีการชำระเงิน</h3>
            <p>รับชำระเงินผ่านโอนเงิน เงินสด หรือผ่อนชำระ 0%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 