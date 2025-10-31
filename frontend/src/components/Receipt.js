import React from 'react';
import './Receipt.css';

const Receipt = ({ orderData }) => {
  const currentDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div className="receipt">
      <div className="quotation-header">
        <div className="company-name">บริษัท เฟอร์นิเจอร์ออฟฟิศ จำกัด</div>
        <div className="quotation-title">ใบกำกับภาษี (Tax Invoice)</div>
      </div>
      
      <div className="quotation-info">
        <div className="info-section">
          <h3>ข้อมูลบริษัท</h3>
          <p><strong>ชื่อผู้ขาย:</strong> บริษัทอาร์ดีเอ็น(ประเทศไทย)จำกัด</p>
          <p><strong>ที่อยู่:</strong> 99/5 หมู่5 ตำบลไทรน้อย อำเภอไทรน้อย จังหวัดนนทบุรี 11150</p>
          <p><strong>เลขประจำตัวผู้เสียภาษี:</strong> 0105533127851</p>
          <p><strong>โทรศัพท์:</strong> 0293347721</p>
          <p><strong>อีเมล:</strong> info@furniture-office.com</p>
        </div>
        <div className="info-section">
          <h3>ข้อมูลลูกค้า</h3>
          <p><strong>ชื่อ:</strong> {orderData.customerName || 'ไม่ระบุ'}</p>
          <p><strong>ที่อยู่จัดส่ง:</strong></p>
          {orderData.deliveryMethod === 'delivery' && orderData.deliveryAddress ? (
            <div style={{ marginTop: '5px' }}>
              {orderData.deliveryAddress.companyName && <p style={{ margin: '2px 0' }}>{orderData.deliveryAddress.companyName}</p>}
              {orderData.deliveryAddress.contactName && <p style={{ margin: '2px 0' }}>ผู้ติดต่อ: {orderData.deliveryAddress.contactName}</p>}
              {orderData.deliveryAddress.address && <p style={{ margin: '2px 0' }}>{orderData.deliveryAddress.address}</p>}
              {(orderData.deliveryAddress.district || orderData.deliveryAddress.amphoe || orderData.deliveryAddress.province) && (
                <p style={{ margin: '2px 0' }}>
                  ตำบล{orderData.deliveryAddress.district || ''} อำเภอ{orderData.deliveryAddress.amphoe || ''} จังหวัด{orderData.deliveryAddress.province || ''}
                </p>
              )}
              {orderData.deliveryAddress.postalCode && <p style={{ margin: '2px 0' }}>รหัสไปรษณีย์ {orderData.deliveryAddress.postalCode}</p>}
              {orderData.deliveryAddress.phone && <p style={{ margin: '2px 0' }}>โทร: {orderData.deliveryAddress.phone}</p>}
            </div>
          ) : orderData.deliveryMethod === 'pickup' && orderData.pickupAddress ? (
            <div style={{ marginTop: '5px' }}>
              {orderData.pickupAddress.companyName && <p style={{ margin: '2px 0' }}>{orderData.pickupAddress.companyName}</p>}
              {orderData.pickupAddress.address && <p style={{ margin: '2px 0' }}>{orderData.pickupAddress.address}</p>}
              {orderData.pickupAddress.phone && <p style={{ margin: '2px 0' }}>โทร: {orderData.pickupAddress.phone}</p>}
              {orderData.pickupAddress.workingHours && <p style={{ margin: '2px 0' }}>{orderData.pickupAddress.workingHours}</p>}
            </div>
          ) : (
            <p style={{ marginTop: '5px' }}>รับสินค้าที่ร้าน</p>
          )}
          <p><strong>เลขที่:</strong> {orderData.orderNumber}</p>
          <p><strong>วันที่:</strong> {currentDate}</p>
        </div>
      </div>

      <table className="receipt-items">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>รุ่น</th>
            <th>รายการสินค้า</th>
            <th>จำนวน</th>
            <th>หน่วยนับ</th>
            <th>ราคาต่อหน่วย</th>
            <th>ราคารวม</th>
          </tr>
        </thead>
        <tbody>
          {orderData.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.product.model}</td>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>ตัว</td>
              <td>{item.product.price.toLocaleString()}</td>
              <td>{(item.product.price * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="total-section">
        <div className="total-row">
          <span>มูลค่าสินค้าก่อนภาษี:</span>
          <span>{(orderData.totalAmount * 0.93).toFixed(2)} บาท</span>
        </div>
        <div className="total-row">
          <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
          <span>{(orderData.totalAmount * 0.07).toFixed(2)} บาท</span>
        </div>
        <div className="grand-total">
          <span>ยอดรวมทั้งสิ้น:</span>
          <span>{orderData.totalAmount.toLocaleString()} บาท</span>
        </div>
      </div>

      <div className="terms">
        <h3>เงื่อนไขการชำระเงิน</h3>
        <ul>
          <li>ชำระเงินภายใน 30 วันนับจากวันที่ออกใบกำกับภาษี</li>
          <li>หากชำระเงินล่าช้าจะคิดดอกเบี้ยร้อยละ 1.5 ต่อเดือน</li>
          <li>การชำระเงินถือเป็นหลักฐานการรับสินค้าเรียบร้อย</li>
          <li>สินค้าที่ขายแล้วไม่รับคืน ยกเว้นกรณีสินค้าชำรุดจากผู้ผลิต</li>
        </ul>
      </div>

      <div className="signature">
        <div className="sign-box">
          <p><strong>ผู้รับเงิน</strong></p>
          <div className="sign-line"></div>
          <p>วันที่ _____________________</p>
        </div>
        <div className="sign-box">
          <p><strong>ผู้รับสินค้า</strong></p>
          <div className="sign-line"></div>
          <p>วันที่ _____________________</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;