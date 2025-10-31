import React from "react";
import "./About.css";


const About = () => {
  const productFiles = [
    "KEL-039.jpg",
    "KEL-077.jpg",
    "KEL-109.jpg",
    "KEL-110.jpg",
    "KEL-111.jpg",
    "KEL-112.jpg",
    "KEL-130.jpg",
    "KEL-152.jpg",
  ];
  return (
    
    <div className="about-page">
      {/* HERO */}
      <section
        className="about-hero"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/BG001.jpg)`
        }}
      >
        <div className="container hero-inner">
          <h1 className="hero-title">ก้าวไกลออฟฟิศเฟอร์นิเจอร์</h1>
        </div>
      </section>

      {/* INTRO (ข้อความกลางสั้น ๆ เหมือนภาพ) */}
      <section className="about-intro">
        <div className="container">
          <h2 className="intro-brand">ก้าวไกลออฟฟิศเฟอร์นิเจอร์</h2>
          <p className="intro-line">
            พบกับโชว์รูมเฟอร์นิเจอร์คุณภาพ สำหรับบ้าน คอนโด และสำนักงาน
          </p>
          <p className="intro-line">
            พร้อมบริการ ที่ตอบโจทย์ ราคาสบายกระเป๋า
          </p>
          <p className="intro-line">
            เรามีสินค้าให้เลือกหลากหลาย เช่น โต๊ะ เก้าอี้ ตู้ ชั้นวางของ
          </p>
        </div>
      </section>

      {/* FEATURES (คงของเดิมไว้) */}
      <section className="about-features">
        <div className="container">
          <h2>จุดเด่นของเรา</h2>
          <div className="features-grid">
            <div className="feature-item">
              <i className="fas fa-medal"></i>
              <h3>คุณภาพสูง</h3>
              <p>เฟอร์นิเจอร์ทุกชิ้นผ่านการคัดสรรและทดสอบคุณภาพอย่างเข้มงวด</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-tags"></i>
              <h3>ราคาเป็นมิตร</h3>
              <p>ราคาโรงงาน ต้นทุนต่ำ กำไรน้อย เพื่อลูกค้า</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-truck"></i>
              <h3>บริการจัดส่ง</h3>
              <p>จัดส่งทั่วประเทศ ปลอดภัย ตรงเวลา</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-headset"></i>
              <h3>บริการหลังการขาย</h3>
              <p>รับประกัน 1 ปี และบริการซ่อมบำรุง</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
