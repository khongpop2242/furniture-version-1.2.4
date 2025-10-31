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
        const response = await axios.get('http://localhost:5050/api/products/bestsellers');
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

  const formatPrice = (n) =>
    `${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿ THB`;

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const getProductImage = (product) => {
    if (product.model) {
      return `/images/products/${product.model}.jpg`;
    }
    return '';
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero-section container">
        <div className="hero-slider">
          <div
            className="hero-slide active"
            style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
          >
            <div className="hero-content">
              <h1>{heroSlides[currentSlide].title}</h1>
              <p>{heroSlides[currentSlide].subtitle}</p>
              <Link to="/products" className="btn btn-primary">ดูสินค้าทั้งหมด</Link>
            </div>
          </div>

          <button className="hero-nav prev" onClick={prevSlide}><i className="fas fa-chevron-left" /></button>
          <button className="hero-nav next" onClick={nextSlide}><i className="fas fa-chevron-right" /></button>

          <div className="hero-dots">
            {heroSlides.map((_, i) => (
              <button key={i} className={`hero-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="product-showcase">
        <div className="container">
          <div className="showcase-images">
            <div className="showcase-image">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office 1" />
            </div>
            <div className="showcase-image">
              <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Office 2" />
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="best-sellers">
        <div className="container">
          <hr className="section-divider" />
          <h2 className="section-title">สินค้าขายดี</h2>

          <div className="products-grid">
            {bestSellers.map((product) => (
              <div key={product.id} className="product-card">
                <Link to={`/product/${product.id}`} className="product-link">
                  <div className="product-image">
                    {getProductImage(product) && (
                      <img 
                        src={getProductImage(product)} 
                        alt={product.name}
                      />
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-model">{product.model}</p>
                    <p className="product-price">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="view-more">
  <Link to="/products" className="view-more-link">
    ดูสินค้าเพิ่มเติม
  </Link>
</div>

        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon"><i className="fas fa-truck" /></div>
              <h3>บริการจัดส่ง</h3>
              <p>จัดส่งทั่วประเทศ ปลอดภัย ตรงเวลา</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon"><i className="fas fa-check" /></div>
              <h3>สินค้าราคาโรงงาน</h3>
              <p>ราคาเป็นมิตร ต้นทุนต่ำ กำไรน้อย</p>
            </div>
            <div className="feature-box">
              <div className="feature-icon"><i className="fas fa-sync-alt" /></div>
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