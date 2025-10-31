import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

export default function Contact() {
  const phones = ["096-399-1916", "096-389-1916", "02-123-4567", "02-987-6543"];
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5050/api/contact', form);
      if (res.data?.success) {
        alert('ส่งข้อความเรียบร้อยแล้ว');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        alert('ส่งไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch (err) {
      console.error(err);
      alert('ส่งไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  return (
    <div className="contact-page">
      <div className="container contact-wrap">
        {/* LEFT */}
        <section className="col-left">
          <h2 className="sec-title">ข้อมูลติดต่อเรา</h2>

          <div className="company-text">
            <p><strong>บริษัท ก้าวไกลเฟอร์นิเจอร์ จำกัด</strong></p>
            <p>ข้อมูลแนะนำบริษัท</p>
            <p>บรรทัด 1</p>
            <p>บรรทัด 2</p>
            <p>บรรทัด 3</p>
          </div>

          <h3 className="contactinfo-title">Contact info</h3>
          <ul className="phone-list" aria-label="เบอร์โทรติดต่อ">
  {phones.map((p) => (
    <li key={p}>
      {/* ใช้ไอคอนโทรศัพท์ (เปลี่ยนเป็น Font Awesome ได้) */}
      <span className="phone-icon" aria-hidden="true">☎</span>
      <a href={`tel:${p.replace(/[^0-9+]/g, '')}`}>{p}</a>
    </li>
  ))}
</ul>
        </section>

        {/* RIGHT */}
        <section className="col-right">
          <h2 className="sec-title">ส่งข้อความถึงเรา</h2>

          <form className="contact-form" onSubmit={onSubmit}>
            {/* ใช้ label ซ่อน เพื่อให้เหมือนภาพ (placeholder เท่านั้น) */}
            <label className="vh" htmlFor="name">ชื่อ - นามสกุล *</label>
            <input
              id="name" name="name" type="text"
              placeholder="ชื่อ - นามสกุล *"
              value={form.name} onChange={onChange} required
            />

            <label className="vh" htmlFor="email">อีเมล์ *</label>
            <input
              id="email" name="email" type="email"
              placeholder="อีเมล์ *"
              value={form.email} onChange={onChange} required
            />

            <label className="vh" htmlFor="phone">เบอร์โทร *</label>
            <input
              id="phone" name="phone" type="tel"
              placeholder="เบอร์โทร *"
              value={form.phone} onChange={onChange}
            />

            <label className="vh" htmlFor="subject">หัวข้อ *</label>
            <input
              id="subject" name="subject" type="text"
              placeholder="หัวข้อ *"
              value={form.subject} onChange={onChange} required
            />

            <label className="vh" htmlFor="message">พิมพ์ข้อความของคุณ ที่นี่ *</label>
            <textarea
              id="message" name="message" rows="5"
              placeholder="พิมพ์ข้อความของคุณ ที่นี่ *"
              value={form.message} onChange={onChange} required
            />

            <button type="submit" className="btn-send">ส่งข้อความ</button>
          </form>
        </section>
      </div>

      {/* COMPANY PHOTO BAR */}
<div
  className="company-photo"
  role="img"
  aria-label="รูปบริษัท (หน้าร้าน)"
  style={{
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/BG001.jpg)`
  }}
/>

    </div>
  );
}
