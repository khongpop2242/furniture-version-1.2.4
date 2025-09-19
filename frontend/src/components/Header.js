import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setShowSuggest(false);
    }
  };

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggest(true);
      } catch (err) {
        setSuggestions([]);
        setShowSuggest(false);
      }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const handleSelectSuggestion = (name) => {
    setSearchQuery(name);
    setShowSuggest(false);
    navigate(`/products?search=${encodeURIComponent(name)}`);
  };

  // Cart count badge
  useEffect(() => {
    let intervalId;
    const fetchCartCount = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/cart');
        const data = await res.json();
        const count = Array.isArray(data) ? data.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    };
    fetchCartCount();
    intervalId = setInterval(fetchCartCount, 5000);
    const onFocus = () => fetchCartCount();
    window.addEventListener('focus', onFocus);
    return () => {
      intervalId && clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // ตรวจสอบ role ของ user
  useEffect(() => {
    const checkUserRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const user = await response.json();
          setUserRole(user.role);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="logo">
              <div className="logo-icon">K</div>
              <span className="logo-text">KaokaiOfficeFurniture</span>
            </div>
            
            <div className="search-bar" onBlur={() => setTimeout(() => setShowSuggest(false), 150)}>
              <form onSubmit={handleSearch} autoComplete="off">
                <input
                  type="text"
                  placeholder="Searching for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length && setShowSuggest(true)}
                />
                <button type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>
              {showSuggest && suggestions.length > 0 && (
                <ul className="search-suggestions">
                  {suggestions.map((s) => (
                    <li key={s.id} onMouseDown={() => handleSelectSuggestion(s.name)}>
                      <span className="suggest-name">{s.name}</span>
                      <span className="suggest-model">{s.model}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="contact-info">
              <a href="tel:0963991916" className="phone-btn phone-green">0963991916</a>
              <a href="tel:0963891916" className="phone-btn phone-red">0963891916</a>
              <Link to="/contact" className="btn btn-secondary">CONTACT</Link>
            </div>

            <div className="header-actions">
              <Link to="/cart" className="cart-icon">
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              {userRole === 'ADMIN' && (
                <Link to="/admin" className="admin-icon" title="แดชบอร์ดผู้ดูแลระบบ">
                  <i className="fas fa-user-shield"></i>
                </Link>
              )}
              <Link to="/profile" className="profile-icon">
                <i className="fas fa-user"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <nav className="navigation">
        <div className="container">
          <ul className="nav-menu">
            <li><Link to="/">หน้าหลัก</Link></li>
            <li><Link to="/products">สินค้า</Link></li>
            <li><Link to="/promotions">โปรโมชั่น</Link></li>
            <li><Link to="/contact">ติดต่อเรา</Link></li>
            <li><Link to="/about">เกี่ยวกับเรา</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header; 