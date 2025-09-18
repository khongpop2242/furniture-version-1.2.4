import React from 'react';
import './Promotions.css';

const Promotions = () => {
  const promotions = [
    {
      id: 1,
      title: "โปรโมชั่นพิเศษ",
      description: "ลดราคาสินค้าทั้งหมด 20% สำหรับลูกค้าใหม่",
      discount: "20%",
      validUntil: "31 ธันวาคม 2024",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "ชุดเฟอร์นิเจอร์สำนักงาน",
      description: "ซื้อชุดโต๊ะทำงาน + เก้าอี้ ลดพิเศษ 15%",
      discount: "15%",
      validUntil: "15 มกราคม 2025",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="promotions-page">
      <div className="container">
        <h1>โปรโมชั่น</h1>
        <div className="promotions-grid">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="promotion-card">
              <div className="promotion-image">
                <img src={promotion.image} alt={promotion.title} />
                <div className="discount-badge">{promotion.discount}</div>
              </div>
              <div className="promotion-info">
                <h3>{promotion.title}</h3>
                <p>{promotion.description}</p>
                <p className="valid-until">หมดอายุ: {promotion.validUntil}</p>
                <button className="btn btn-primary">ดูรายละเอียด</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Promotions; 