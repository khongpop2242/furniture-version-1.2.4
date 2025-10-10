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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // ฟังก์ชันสำหรับดึงรูปภาพจากโฟลเดอร์ local
  const getProductImage = (productId) => {
    const imageNumber = ((productId - 1) % 4) + 1;
    return `/images/products/product${imageNumber}.jpg`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('ไม่พบสินค้า');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await axios.post('http://localhost:5000/api/cart', {
          productId: product.id,
          quantity: 1
        });
      }
      setNotificationMessage(`เพิ่ม "${product.name}" จำนวน ${quantity} ชิ้นลงตะกร้าเรียบร้อยแล้ว`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotificationMessage('เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    setNotificationMessage(isFavorite ? 'ลบออกจากรายการโปรดแล้ว' : 'เพิ่มในรายการโปรดแล้ว');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
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
              >
                <i className={isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
              <img 
                src={getProductImage(product.id)} 
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
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button 
                className="btn btn-primary add-to-cart"
                onClick={addToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'กำลังเพิ่ม...' : 'เพิ่มใส่รถเข็น'}
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
