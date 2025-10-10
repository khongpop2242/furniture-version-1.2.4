import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products/bestsellers');
        setBestSellers(response.data);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      }
    };

    fetchBestSellers();
  }, []);

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      title: 'เฟอร์นิเจอร์สำนักงานคุณภาพสูง',
      subtitle: 'ออกแบบเพื่อประสิทธิภาพและความสะดวกสบาย'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      title: 'โซลูชันการจัดวางที่ครบครัน',
      subtitle: 'จากโต๊ะทำงานไปจนถึงพื้นที่จัดเก็บ'
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slider">
          <div className="hero-slide active" style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}>
            <div className="hero-content">
              <h1>{heroSlides[currentSlide].title}</h1>
              <p>{heroSlides[currentSlide].subtitle}</p>
              <Link to="/products" className="btn btn-primary">ดูสินค้าทั้งหมด</Link>
            </div>
          </div>
          
          <button className="hero-nav prev" onClick={prevSlide}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="hero-nav next" onClick={nextSlide}>
            <i className="fas fa-chevron-right"></i>
          </button>
          
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="product-showcase">
        <div className="container">
          <div className="showcase-images">
            <div className="showcase-image">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office Setup 1" />
            </div>
            <div className="showcase-image">
              <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office Setup 2" />
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="best-sellers">
        <div className="container">
          <h2 className="section-title">สินค้าขายดี</h2>
          <div className="products-grid">
            {bestSellers.map((product) => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-model">รุ่น: {product.model}</p>
                    <p className="product-price">{product.price.toLocaleString()} บาท</p>
                  </div>
                </Link>
                <div className="product-actions">
                  <button className="btn btn-primary">เพิ่มลงตะกร้า</button>
                </div>
              </div>
            ))}
          </div>
          <div className="view-more">
            <Link to="/products" className="btn btn-secondary">ดูสินค้าเพิ่มเติม</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon">
                <i className="fas fa-truck"></i>
              </div>
              <h3>บริการจัดส่ง</h3>
              <p>จัดส่งทั่วประเทศ ปลอดภัย ตรงเวลา</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>สินค้าราคาโรงงาน</h3>
              <p>ราคาเป็นมิตร ต้นทุนต่ำ กำไรน้อย</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <i className="fas fa-sync-alt"></i>
              </div>
              <h3>รับประกัน 1 ปี</h3>
              <p>รับประกันคุณภาพสินค้า 1 ปีเต็ม</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 