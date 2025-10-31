import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(getApiUrl('api/favorites'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Favorites data:', response.data);
      console.log('First favorite product:', response.data[0]?.product);
      console.log('Product model:', response.data[0]?.product?.model);
      console.log('Image path will be:', `/images/products/${response.data[0]?.product?.model}.jpg`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลรายการโปรด');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(getApiUrl(`api/favorites/${productId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });

      // อัปเดตรายการ favorites
      setFavorites(favorites.filter(fav => fav.productId !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError('เกิดข้อผิดพลาดในการลบสินค้าออกจากรายการโปรด');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading">กำลังโหลด...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>รายการโปรด</h1>
        <p>สินค้าที่คุณชื่นชอบ</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">❤️</div>
          <h2>ยังไม่มีสินค้าในรายการโปรด</h2>
          <p>เริ่มต้นเพิ่มสินค้าที่คุณชื่นชอบลงในรายการโปรด</p>
          <button 
            className="browse-products-btn"
            onClick={() => navigate('/products')}
          >
            ดูสินค้าทั้งหมด
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-item">
              <div 
                className="product-link"
                onClick={() => navigate(`/product/${favorite.productId}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image">
                  <img 
                    src={`/images/products/${favorite.product.model}.jpg`}
                    alt={favorite.product.name}
                    onError={(e) => {
                      console.log('Image failed to load:', `/images/products/${favorite.product.model}.jpg`);
                      e.target.src = '/images/NoImage.png';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', `/images/products/${favorite.product.model}.jpg`);
                    }}
                  />
                  <button 
                    className="remove-favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(favorite.productId);
                    }}
                    title="ลบออกจากรายการโปรด"
                  >
                    ❤️
                  </button>
                </div>
                
                <div className="product-info">
                  <h3>{favorite.product.name}</h3>
                  <p className="product-model">{favorite.product.model}</p>
                  <p className="product-category">{favorite.product.category}</p>
                  
                  <div className="product-price">
                    {favorite.product.isOnSale ? (
                      <>
                        <span className="sale-price">
                          {formatPrice(favorite.product.price)}
                        </span>
                        <span className="original-price">
                          {formatPrice(favorite.product.originalPrice)}
                        </span>
                        <span className="discount">
                          -{favorite.product.discount}%
                        </span>
                      </>
                    ) : (
                      <span className="price">
                        {formatPrice(favorite.product.price)}
                      </span>
                    )}
                  </div>

                  <div className="product-rating">
                    <span className="stars">
                      {'★'.repeat(Math.floor(favorite.product.rating))}
                      {'☆'.repeat(5 - Math.floor(favorite.product.rating))}
                    </span>
                    <span className="rating-text">
                      ({favorite.product.reviews} รีวิว)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
