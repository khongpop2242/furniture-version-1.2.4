import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const formatBaht = (amount) => {
  if (typeof amount !== 'number') return '-';
  return (amount / 100).toLocaleString('th-TH', { minimumFractionDigits: 2 });
};

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        if (!sessionId) return;
        const { data } = await axios.get(`http://localhost:5000/api/checkout/session/${sessionId}`);
        setData(data);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const printReceipt = () => {
    const w = window.open('', '_blank');
    const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>ใบเสร็จรับเงิน</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
          h1 { margin: 0 0 16px; }
          .meta { margin: 8px 0; }
          .total { font-size: 20px; font-weight: bold; margin-top: 16px; }
        </style>
      </head>
      <body>
        <h1>ใบเสร็จรับเงิน</h1>
        <div class="meta">เลขที่รายการ: ${data?.id || '-'}</div>
        <div class="meta">อีเมลลูกค้า: ${data?.customer_email || '-'}</div>
        <div class="meta">สถานะการชำระเงิน: ${data?.payment_status || '-'}</div>
        <div class="total">ยอดชำระ: ฿${formatBaht(data?.amount_total)}</div>
        <script>window.print();setTimeout(() => window.close(), 300);</script>
      </body>
      </html>
    `;
    w.document.write(html);
    w.document.close();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        กำลังโหลดผลการชำระเงิน...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
      <h2>ชำระเงินสำเร็จ</h2>
      <p>ขอบคุณสำหรับการสั่งซื้อของคุณ</p>
      <div style={{ marginTop: 16 }}>
        <div>เลขที่รายการ: {data?.id}</div>
        <div>ยอดชำระ: ฿{formatBaht(data?.amount_total)}</div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={printReceipt}>พิมพ์ใบเสร็จ</button>
        <Link to="/products" className="btn btn-secondary">เลือกซื้อสินค้าต่อ</Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;


