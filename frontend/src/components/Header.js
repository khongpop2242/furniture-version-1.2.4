import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);        // ← เพิ่ม
  const closeNav = () => setNavOpen(false);

  // ฟังก์ชันสำหรับอัพเดทจำนวนสินค้าในตะกร้า
  const updateCartCount = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }

    fetch(getApiUrl('api/cart'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const count = Array.isArray(data) ? data.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
        setCartCount(count);
        console.log('Cart count updated:', count);
      })
      .catch(e => {
        console.error('Error fetching cart count:', e);
        setCartCount(0);
      });
  };

  // ฟังก์ชันสำหรับส่ง event เมื่อมีการเปลี่ยนแปลงตะกร้า
  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartCount();
    };

    // ฟัง event เมื่อมีการเปลี่ยนแปลงตะกร้า
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

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
        const res = await fetch(getApiUrl(`api/search?q=${encodeURIComponent(searchQuery)}`));
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

  // Cart count badge - อัพเดททุก 5 วินาที
  useEffect(() => {
    let intervalId;

    // อัพเดทครั้งแรก
    updateCartCount();

    // อัพเดททุก 5 วินาที
    intervalId = setInterval(updateCartCount, 5000);

    // อัพเดทเมื่อ focus หน้าต่าง
    const onFocus = () => updateCartCount();
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
        const response = await fetch(getApiUrl('api/auth/me'), {
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
            <Link to="/" className="logo">
              <img
                src="/images/logo-kaokai-wh.png"
                alt="Kaokai Office Furniture"
                className="logo-img"
              />
            </Link>


            <div className="search-bar" onBlur={() => setTimeout(() => setShowSuggest(false), 150)}>
              <form onSubmit={handleSearch} autoComplete="off">
  <input
    type="text"
    placeholder="ค้นหา ..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onFocus={() => suggestions.length && setShowSuggest(true)}
  />
  <button type="submit" aria-label="ค้นหา">
    <img src="/search.png" alt="" className="search-icon-img" />
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
              {/* LINE pill (ใช้รูปจาก public) */}
              <a href="tel:0963891916" className="pill pill-green" aria-label="LINE โทร 0963891916">
                <img src="/LINE_logo.svg.png" alt="LINE" className="pill-logo" />
                <span>0963891916</span>
              </a>

              {/* Phone pill */}
              <a href="tel:0963891916" className="pill pill-red" aria-label="โทรศัพท์ 0963891916">
                <i className="fas fa-phone pill-ic" aria-hidden="true" />
                <span>0963891916</span>
              </a>

              <Link to="/contact" className="pill pill-gray">CONTACT</Link>
            </div>

            {/* ไอคอน + Hamburger */}
            <div className="header-actions">
              <Link to="/cart" className="cart-icon" onClick={closeNav}>
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              {userRole === 'ADMIN' && (
                <Link to="/admin" className="admin-icon" title="แดชบอร์ดผู้ดูแลระบบ" onClick={closeNav}>
                  <i className="fas fa-user-shield"></i>
                </Link>
              )}
              {localStorage.getItem('token') ? (
                <Link to="/profile" className="profile-icon" onClick={closeNav}>
                  <i className="fas fa-user"></i>
                </Link>
              ) : (
                <div className="auth-links">
                  <Link to="/login" className="login-link" onClick={closeNav}>
                    <i className="fas fa-user"></i>
                  </Link>
                </div>
              )}

              {/* Hamburger: โผล่เฉพาะจอเล็ก */}
              <button
                className={`hamburger ${navOpen ? 'is-active' : ''}`}
                aria-label="เปิด/ปิดเมนู"
                aria-expanded={navOpen}
                onClick={() => setNavOpen(v => !v)}
              >
                <span className="hamburger-box"><span className="hamburger-inner" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* เมนูหลัก: เปิด/ปิดด้วย navOpen */}
      <nav className={`navigation ${navOpen ? 'is-open' : ''}`}>
        <div className="container">
          <ul className="nav-menu" onClick={closeNav}>
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