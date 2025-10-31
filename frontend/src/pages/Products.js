import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const itemsPerPage = 16;

  // ฟังก์ชันสำหรับดึงรูปภาพจากโฟลเดอร์ public/images/products
  const getProductImage = (product) => {
    if (product.model) {
      // ใช้รหัสสินค้า (model) เป็นชื่อไฟล์รูป .jpg
      return `/images/products/${product.model}.jpg`;
    }
    return '';
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5050/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // recommended
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [products, selectedCategory, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];



  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // ด้านบน component
const formatPrice = (n) =>
  `${Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} ฿ THB`;


  return (
    <div className="products-page">
      <div className="container">
        <h1>สินค้าทั้งหมด</h1>
        

        {/* Filter and Sort Controls */}
        <div className="filter-sort-container">
          <div className="filter-section">
            <div className="filter-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
              </svg>
              <span>ตัวกรองสินค้า</span>
            </div>
            
            <div className="category-filters">
              <label className={`category-option ${selectedCategory === '' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <span>ทั้งหมด</span>
              </label>
              {categories.map((category) => (
                <label key={category} className={`category-option ${selectedCategory === category ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sort-section">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="recommended">เรียงตาม : แนะนำ</option>
              <option value="price-low">เรียงตาม : ราคาต่ำ-สูง</option>
              <option value="price-high">เรียงตาม : ราคาสูง-ต่ำ</option>
              <option value="name">เรียงตาม : ชื่อสินค้า</option>
              <option value="rating">เรียงตาม : คะแนน</option>
            </select>
          </div>
        </div>
        
        <div className="products-grid">
          {currentProducts.map((product) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              แสดง {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} จาก {filteredProducts.length} รายการ
            </div>
            <div className="pagination-controls">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 