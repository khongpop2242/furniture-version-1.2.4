import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId, productName) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      await axios.post('http://localhost:5000/api/cart', {
        productId: productId,
        quantity: 1
      });
      
      setNotification({
        type: 'success',
        message: `เพิ่ม "${productName}" ลงตะกร้าเรียบร้อยแล้ว`
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <h1>สินค้าทั้งหมด</h1>
          <div className="loading">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>สินค้าทั้งหมด</h1>
        
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image || '/images/placeholder-product.svg'} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-model">รุ่น: {product.model}</p>
                <p className="product-category">{product.category}</p>
                <p className="product-price">{product.price.toLocaleString()} บาท</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => addToCart(product.id, product.name)}
                  disabled={addingToCart[product.id]}
                >
                  {addingToCart[product.id] ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products; 