import React from "react";
import "./Promotions.css";

export default function Promotions() {
  return (
    <div className="promotions-page">
      <section className="promo-hero">
        <div className="container">
          <h1 className="promo-eyebrow">COMING SOON !!!</h1>

          <h2 className="promo-title">
            สินค้าโปรโมชั่นพร้อมส่งลดล้างสต๊อก พร้อมส่วนลด
          </h2>

          <p className="promo-discount">
            สูงสุด <span className="accent">80%</span>
          </p>

          <p className="promo-note">พบกับสินค้าโปรโมชั่น พร้อมส่ง เร็วๆนี้ ...</p>
        </div>
      </section>
    </div>
  );
}
