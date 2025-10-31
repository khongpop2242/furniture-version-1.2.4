import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // ฟังก์ชันสำหรับดึงรูปภาพ: ให้ใช้รหัสสินค้า (model) เป็นไฟล์รูปหลัก
  const getProductImage = (product) => {
    if (!product) return '/images/NoImage.png';

    // ถ้ามี model ให้ใช้ชื่อไฟล์จาก model (เช่น KEL-152.jpg)
    if (product.model) {
      return `/images/products/${product.model}.jpg`;
    }

    // ถ้าไม่มี model แต่มีฟิลด์ image อยู่ ให้ fallback ไปที่ field นั้น
    if (product.image) {
      if (product.image.startsWith('http')) return product.image;
      return `/images/products/${product.image}`;
    }

    // ค่าเริ่มต้น
    return '/images/NoImage.png';
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('ไม่พบสินค้า');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    const checkFavorite = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`http://localhost:5050/api/favorites/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsFavorite(response.data.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    fetchProduct();
    checkFavorite();
  }, [id]);

  const addToCart = async () => {
    // ตรวจสอบการล็อกอินก่อนเพิ่มลงตะกร้า
    const token = localStorage.getItem('token');
    if (!token) {
      setNotificationMessage('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    // ตรวจสอบ stock ก่อนเพิ่มลงตะกร้า
    if (product.stock <= 0) {
      setNotificationMessage(`สินค้า "${product.name}" หมดสต็อกแล้ว`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    if (product.stock < quantity) {
      setNotificationMessage(`สินค้า "${product.name}" เหลือเพียง ${product.stock} ชิ้น`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setAddingToCart(true);
    try {
      await axios.post('http://localhost:5050/api/cart', {
        productId: product.id,
        quantity: quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationMessage(`เพิ่ม "${product.name}" จำนวน ${quantity} ชิ้นลงตะกร้าเรียบร้อยแล้ว`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // ส่ง event เพื่ออัพเดทจำนวนสินค้าใน Header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า';
      setNotificationMessage(errorMessage);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotificationMessage('กรุณาเข้าสู่ระบบเพื่อเพิ่มสินค้าเข้ารายการโปรด');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    setAddingToFavorites(true);

    try {
      if (isFavorite) {
        // ลบออกจาก favorites
        await axios.delete(`http://localhost:5050/api/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        setNotificationMessage(`ลบ "${product.name}" ออกจากรายการโปรดแล้ว`);
      } else {
        // เพิ่มเข้า favorites
        await axios.post('http://localhost:5050/api/favorites', {
          productId: id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
        setNotificationMessage(`เพิ่ม "${product.name}" เข้ารายการโปรดแล้ว`);
      }
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setNotificationMessage('เกิดข้อผิดพลาดในการจัดการรายการโปรด');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setAddingToFavorites(false);
    }
  };



  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-message">
            <h2>ไม่พบสินค้า</h2>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              กลับไปหน้ารายการสินค้า
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail-container">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <button 
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                disabled={addingToFavorites}
                title={isFavorite ? 'ลบออกจากรายการโปรด' : 'เพิ่มเข้ารายการโปรด'}
              >
                {addingToFavorites ? '...' : (isFavorite ? '❤️' : '🤍')}
              </button>
              <img 
                src={getProductImage(product)} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/NoImage.png';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <p className="product-category">หมวดสินค้าประเภทตู้, ตู้เอกสาร/ตู้บานเลื่อน/เหล็ก</p>
            <h1 className="product-name">{product.name}</h1>
            <p className="product-code">{product.model}</p>
            <p className="product-feature">มีกุญแจล็อครหัส</p>
            
            <div className="product-price">
              <span className="current-price">{product.price.toLocaleString()} บาท</span>
            </div>

            <div className="product-stock">
              <span className={`stock-info ${product.stock <= 0 ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : 'in-stock'}`}>
                {product.stock <= 0 ? 'หมดสต็อก' : 
                 product.stock <= 5 ? `เหลือเพียง ${product.stock} ชิ้น` : 
                 `มีสินค้า ${product.stock} ชิ้น`}
              </span>
            </div>

            <div className="quantity-selector">
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button 
                className="btn btn-primary add-to-cart"
                onClick={addToCart}
                disabled={addingToCart || product.stock <= 0}
              >
                {product.stock <= 0 ? 'หมดสต็อก' : 
                 addingToCart ? 'กำลังเพิ่ม...' : 'เพิ่มใส่รถเข็น'}
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {showNotification && (
          <div className="notification success">
            {notificationMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
