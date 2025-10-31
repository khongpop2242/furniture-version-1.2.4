// src/pages/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import './OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Helpers ----------
  const getProductImage = (product) => {
    if (product?.model) return `/images/products/${product.model}.jpg`;
    return '/images/NoImage.png';
  };
  const thMoney = (n = 0) =>
    `฿${Number(n || 0).toLocaleString('th-TH', { maximumFractionDigits: 2 })}`;
  const thDateTime = (d) =>
    new Date(d).toLocaleString('th-TH', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });

  // ดึงข้อมูล
  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const [orderRes, meRes] = await Promise.all([
        axios.get(getApiUrl(`api/orders/${orderId}`), {
          headers: { Authorization: `Bearer ${token}` }, timeout: 10000
        }),
        axios.get(getApiUrl('api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` }, timeout: 10000
        })
      ]);

      if (!orderRes.data) throw new Error('NOT_FOUND');
      setOrder(orderRes.data);
      setUserAddress(meRes.data || null);
    } catch (err) {
      console.error('Error fetching order details:', err);
      if (err.response?.status === 404) setError('ไม่พบคำสั่งซื้อนี้');
      else if (err.response?.status === 403) setError('คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้');
      else setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchOrderDetails(); /* eslint-disable-next-line */ }, [orderId]);

  // สถานะ
  const statusText = {
    PENDING: 'รอดำเนินการ',
    CONFIRMED: 'ยืนยันแล้ว',
    SHIPPED: 'จัดส่งแล้ว',
    DELIVERED: 'ส่งมอบแล้ว',
    CANCELLED: 'ยกเลิก'
  };
  const statusColor = {
    PENDING: '#f59e0b',
    CONFIRMED: '#0ea5e9',
    SHIPPED: '#3b82f6',
    DELIVERED: '#22c55e',
    CANCELLED: '#ef4444'
  };

  // ไทม์ไลน์
  const buildTimeline = (o) => {
    if (!o) return [];
    if (Array.isArray(o.statusHistory) && o.statusHistory.length) {
      return o.statusHistory.map((x) => ({
        label: x.label || statusText[x.status] || x.status,
        date: x.date || o.updatedAt || o.createdAt
      }));
    }
    const tl = [{ label: 'สร้างคำสั่งซื้อ', date: o.createdAt }];
    if (o.confirmedAt) tl.push({ label: 'ยืนยันแล้ว', date: o.confirmedAt });
    if (o.shippedAt) tl.push({ label: 'จัดส่งแล้ว', date: o.shippedAt });
    if (o.deliveredAt) tl.push({ label: 'ส่งมอบแล้ว', date: o.deliveredAt });
    return tl;
  };

  // ที่อยู่จัดส่ง (แสดงบนการ์ดกลาง)
  const renderAddressHTML = (o) => {
    try {
      if (o.deliveryMethod === 'delivery' && o.deliveryDetails) {
        const a = typeof o.deliveryDetails === 'string'
          ? JSON.parse(o.deliveryDetails) : o.deliveryDetails;
        return (
          <>
            {a.companyName && <p>{a.companyName}</p>}
            {a.contactName && <p>ผู้ติดต่อ: {a.contactName}</p>}
            {a.address && <p>{a.address}</p>}
            {(a.district || a.amphoe || a.province) &&
              <p>ตำบล{a.district || ''} อำเภอ{a.amphoe || ''} จังหวัด{a.province || ''}</p>}
            {a.postalCode && <p>รหัสไปรษณีย์ {a.postalCode}</p>}
            {a.phone && <p>โทร: {a.phone}</p>}
          </>
        );
      }
    } catch (_) { /* ignore */ }

    if (o.shippingAddress && o.shippingAddress !== 'ที่อยู่จัดส่ง') {
      return <p>{o.shippingAddress}</p>;
    }
    if (userAddress && (userAddress.address || userAddress.district || userAddress.province)) {
      return (
        <>
          <p>{userAddress.name || '-'}</p>
          {userAddress.address && <p>{userAddress.address}</p>}
          {(userAddress.district || userAddress.amphoe || userAddress.province) &&
            <p>ตำบล{userAddress.district || ''} อำเภอ{userAddress.amphoe || ''} จังหวัด{userAddress.province || ''}</p>}
          {userAddress.postalCode && <p>รหัสไปรษณีย์ {userAddress.postalCode}</p>}
          {userAddress.phone && <p>โทร: {userAddress.phone}</p>}
        </>
      );
    }
    return <p>รับสินค้าที่ร้าน</p>;
  };

  // ---------- Receipt Retro (พิมพ์ย้อนหลังแบบในรูป) ----------
  // ดึง snapshot ที่อยู่จัดส่งที่บันทึกตอนจัดส่ง
  const getSavedShippingAddress = (o) => {
    const raw =
      o?.shippingSnapshot ||
      o?.deliveryAddressSnapshot ||
      o?.invoiceAddressSnapshot ||
      o?.deliveryDetails || // ที่เคยใช้ตอน generate เดิม
      null;

    if (raw) {
      try {
        const x = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return {
          name: x.name || x.contactName || o?.user?.name || '-',
          company: x.companyName || '',
          address: x.address || x.addressLine || '',
          district: x.district || '',
          amphoe: x.amphoe || x.amphur || '',
          province: x.province || '',
          postalCode: x.postalCode || x.zip || '',
          phone: x.phone || x.tel || ''
        };
      } catch (_) {}
    }
    if (o?.shippingAddress && o.shippingAddress !== 'ที่อยู่จัดส่ง') {
      return { name: o?.user?.name || '-', address: o.shippingAddress };
    }
    if (userAddress && (userAddress.address || userAddress.province)) {
      return {
        name: userAddress.name || '-',
        company: userAddress.companyName || '',
        address: userAddress.address || '',
        district: userAddress.district || '',
        amphoe: userAddress.amphoe || '',
        province: userAddress.province || '',
        postalCode: userAddress.postalCode || '',
        phone: userAddress.phone || ''
      };
    }
    return { name: '-', address: 'รับสินค้าที่ร้าน' };
  };
  const thDate = (d) =>
    new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const thMoney2 = (n = 0) =>
    Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const generateReceiptRetro = () => {
    if (!order) return;

    const addr = getSavedShippingAddress(order);
    const items = order.orderItems || [];

    const subtotalRaw = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
    const grossFromOrder = Number(order.total ?? subtotalRaw);

    const vatRate = Number(order.vatRate ?? 0.07);
    const assumeGross = order.includesVat === undefined ? true : !!order.includesVat;

    const gross = assumeGross ? grossFromOrder : subtotalRaw * (1 + vatRate);
    const net = assumeGross ? (gross / (1 + vatRate)) : subtotalRaw;
    const vat = gross - net;

    const volNo = '001';
    const docNo = `RDN${String(order.id).padStart(3, '0')}`;
    const logo = `${window.location.origin}/images/logo-kaokai-wh.png`;

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ใบเสร็จรับเงิน/ใบกำกับภาษี #${order.id}</title>
<style>
  @page { size: A4; margin: 22mm 18mm; }
  body { font-family: "Sarabun", Arial, sans-serif; color:#111; }
  .doc { max-width: 800px; margin: 0 auto; }
  .hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
  .brand { display:flex; align-items:center; gap:12px; }
  .brand img { height:28px; }
  .title { font-size:22px; font-weight:800; }
  .meta { display:flex; gap:24px; margin:18px 0 12px; }
  .meta > div { min-width:180px; }
  .line { border-top:2px solid #111; margin:8px 0 16px; }
  .seller, .buyer { line-height:1.7; }
  .tbl { width:100%; border-collapse:collapse; margin:14px 0 10px; }
  .tbl th, .tbl td { border:1px solid #111; padding:8px 10px; vertical-align:top; }
  .tbl th { background:#fff; font-weight:700; text-align:left; }
  .right { text-align:right; }
  .totals { width:100%; margin-top:6px; }
  .totals .row { display:grid; grid-template-columns:1fr 160px; padding:4px 0; }
  .totals .row .label { text-align:right; padding-right:10px; }
  .footnote { margin-top:26px; font-size:12px; color:#555; }
</style>
</head>
<body>
<div class="doc">
  <div class="hdr">
    <div class="brand">
      <img src="${logo}" onerror="this.style.display='none'">
      <div style="font-weight:800;"></div>
    </div>
    <div class="title">ใบเสร็จรับเงิน / ใบกำกับภาษี</div>
  </div>

  <div class="meta">
    <div>วันที่ ${thDate(order.createdAt)}</div>
    <div>เล่มที่ ${volNo}</div>
    <div>เลขที่ ${docNo}</div>
  </div>

  <div class="seller">
    <div><strong>ชื่อผู้ขาย</strong> บริษัทอาร์ดีเอ็น(ประเทศไทย)จำกัด</div>
    <div><strong>ที่อยู่</strong> 99/5 หมู่5 ตำบลไทรน้อย อำเภอไทรน้อย จังหวัดนนทบุรี 11150</div>
    <div><strong>เลขประจำตัวผู้เสียภาษี</strong> 0105533127851 &nbsp;&nbsp; <strong>โทรศัพท์</strong> 0293347721</div>
  </div>

  <div class="line"></div>

  <div class="buyer">
    <div><strong>ชื่อลูกค้า</strong> ${addr.name || '-'}</div>
    ${addr.company ? `<div><strong>บริษัท</strong> ${addr.company}</div>` : ''}
    ${addr.address ? `<div><strong>ที่อยู่</strong> ${addr.address}</div>` : ''}
    ${(addr.district||addr.amphoe||addr.province||addr.postalCode) ? 
      `<div>${addr.district?`ตำบล ${addr.district}`:''}
            ${addr.amphoe?`อำเภอ ${addr.amphoe}`:''}
            ${addr.province?`จังหวัด ${addr.province}`:''}
            ${addr.postalCode?addr.postalCode:''}</div>` : ''}
    ${addr.phone ? `<div><strong>โทร</strong> ${addr.phone}</div>` : ''}
  </div>

  <table class="tbl">
    <thead>
      <tr>
        <th style="width:48px">ลำดับ<br><small>No</small></th>
        <th style="width:90px">รุ่น<br><small>Model</small></th>
        <th>รายการสินค้า<br><small>Description</small></th>
        <th style="width:80px" class="right">จำนวน<br><small>Quantity</small></th>
        <th style="width:90px" class="right">หน่วยนับ<br><small>Unit</small></th>
        <th style="width:110px" class="right">ราคาต่อหน่วย<br><small>Unit Price</small></th>
        <th style="width:120px" class="right">ราคารวม<br><small>Amount</small></th>
      </tr>
    </thead>
    <tbody>
      ${items.map((it, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${it.product?.model || '-'}</td>
          <td>${it.name || '-'}</td>
          <td class="right">${it.quantity || 0}</td>
          <td class="right">ตัว</td>
          <td class="right">${thMoney2(it.price)}</td>
          <td class="right">${thMoney2(Number(it.price||0)*Number(it.quantity||0))}</td>
        </tr>
      `).join('')}
      <tr><td colspan="7" style="height:140px">&nbsp;</td></tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><div class="label">มูลค่าสินค้าก่อนเสียภาษี</div><div class="right">${thMoney2(net)}</div></div>
    <div class="row"><div class="label">ภาษีมูลค่าเพิ่ม (VAT ${Math.round(vatRate*100)}%)</div><div class="right">${thMoney2(vat)}</div></div>
    <div class="row"><div class="label"><strong>ยอดรวม</strong></div><div class="right"><strong>${thMoney2(gross)}</strong></div></div>
  </div>

  <div class="footnote">
    * เอกสารนี้พิมพ์จากระบบย้อนหลัง โดยดึง “ที่อยู่จัดส่งตามบิลที่บันทึกไว้ตอนจัดส่ง”
  </div>
</div>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),100));</script>
</body></html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `invoice-${order.id}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => {
      const w = window.open('', '_blank');
      w.document.write(html); w.document.close();
    }, 80);
  };

  // ---------- Render ----------
  if (loading) return (
    <div className="order-detail-page"><div className="loading">กำลังโหลด...</div></div>
  );
  if (error) return (
    <div className="order-detail-page">
      <div className="error-container">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate('/profile')}>กลับไปยังโปรไฟล์</button>
      </div>
    </div>
  );
  if (!order) return null;

  const items = order.orderItems || [];
  const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
  const discount = Number(order.discount || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const platformFee = Number(order.platformFee || 0);
  const ccFee = Number(order.creditCharge || 0);
  const total = Number(order.total ?? (subtotal - discount + shippingFee));
  const eligible = total - platformFee - ccFee;
  const timeline = buildTimeline(order);
  const currentStatus = statusText[order.status] || order.status;

  return (
    <div className="order-detail-page">
      <div className="od-shell">
        {/* Top bar */}
        <div className="od-topbar">
          <div>
            <h1>Order Number <span>#{order.id}</span></h1>
            <div className="od-meta">
              <div><span>Order Created</span><strong>{thDateTime(order.createdAt)}</strong></div>
              <div>
                <span>Status</span>
                <strong className="badge"
                  style={{ backgroundColor: `${statusColor[order.status] || '#64748b'}20`,
                           color: statusColor[order.status] || '#111827' }}>
                  {currentStatus}
                </strong>
              </div>
            </div>
          </div>
          <div className="od-actions">
            <button className="btn-outline" onClick={() => navigate('/profile')}>กลับ</button>
            <button className="btn-primary" onClick={generateReceiptRetro}>บันทึกใบเสร็จ (ย้อนหลัง)</button>
          </div>
        </div>

        {/* 3 cards */}
        <div className="od-grid3">
          <section className="od-card">
            <div className="od-card__title">Customer Details</div>
            <div className="od-deflist">
              <div><span>Name</span><strong>{order.user?.name || '-'}</strong></div>
              <div><span>Email</span><strong><a href={`mailto:${order.user?.email || ''}`}>{order.user?.email || '-'}</a></strong></div>
              <div><span>Phone</span><strong>{order.user?.phone || '-'}</strong></div>
            </div>
          </section>

          <section className="od-card">
            <div className="od-card__title">Delivery Address</div>
            <div className="od-address">{renderAddressHTML(order)}</div>
          </section>

          {/* --- Order History --- */}
<section className="od-card od-history">
  <div className="od-card__title">Order History</div>

  <ol className="od-steps">
    {buildTimeline(order).map((t, i, arr) => {
      // ระบุสี/สถานะของจุด
      const isLast = i === arr.length - 1;
      const st = (t.status || order.status || '').toUpperCase();
      const colorClass =
        st === 'DELIVERED' ? 'is-delivered' :
        st === 'SHIPPED'   ? 'is-shipped'   :
        st === 'CONFIRMED' ? 'is-confirmed' :
        st === 'CANCELLED' ? 'is-cancelled' : 'is-pending';

      return (
        <li key={i} className={`step ${colorClass} ${isLast ? 'is-active' : ''}`}>
          <span className="dot" aria-hidden />
          <div className="step-body">
            <div className="step-title">
              {t.label || t.title || 'อัปเดตสถานะ'}
              {isLast && <span className="chip">ปัจจุบัน</span>}
            </div>
            <div className="step-sub">{new Date(t.date || order.createdAt).toLocaleString('th-TH', {
              year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
            })}</div>
          </div>
        </li>
      );
    })}
  </ol>
</section>

        </div>

        {/* Items + Summary */}
        <div className="od-grid2">
          <section className="od-card">
            <div className="od-card__title">Item Summary</div>
            <div className="od-table-wrap">
              <table className="od-table">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>รายละเอียด</th>
                    <th className="t-right">QTY</th>
                    <th className="t-right">Price</th>
                    <th className="t-right">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="td-product">
                        <img
                          src={getProductImage(it.product)}
                          alt={it.name}
                          onError={(e) => { e.target.src = '/images/NoImage.png'; }}
                        />
                      </td>
                      <td>
                        <div className="p-name">{it.name}</div>
                        <div className="p-sub">รุ่น: {it.product?.model || '-'}</div>
                      </td>
                      <td className="t-right">{it.quantity}</td>
                      <td className="t-right">{thMoney(it.price)}</td>
                      <td className="t-right">{thMoney(Number(it.price) * Number(it.quantity))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="od-card od-summary">
            <div className="od-card__title">Order Summary</div>
            <div className="sum-row"><span>Payment</span><strong>{order.paymentMethod ? order.paymentMethod : '—'}</strong></div>
            <div className="sum-row"><span>Subtotal</span><strong>{thMoney(subtotal)}</strong></div>
            {!!discount && <div className="sum-row"><span>Discount</span><strong>-{thMoney(discount)}</strong></div>}
            <div className="sum-row"><span>Delivery Fee</span><strong>{shippingFee ? thMoney(shippingFee) : '฿0.00'}</strong></div>
            <div className="sum-row total"><span>Total</span><strong>{thMoney(total)}</strong></div>
            {!!platformFee && <div className="sum-row"><span>Platform Fee</span><strong>-{thMoney(platformFee)}</strong></div>}
            {!!ccFee && <div className="sum-row"><span>Credit Card Charge</span><strong>-{thMoney(ccFee)}</strong></div>}
            <div className="sum-row eligible"><span>Eligible</span><strong>{thMoney(eligible)}</strong></div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
