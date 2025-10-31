import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // ตรวจสอบการ login และ role
    const token = localStorage.getItem('token');
    if (!token) {
      setError('กรุณาเข้าสู่ระบบก่อน');
      setLoading(false);
      return;
    }
    
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.role !== 'ADMIN') {
        setError('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ - ต้องเป็น Admin เท่านั้น');
        setLoading(false);
        return;
      }
      
      setUserRole(response.data.role);
      setIsAuthenticated(true);
      fetchUsers();
    } catch (error) {
      console.error('Error checking user role:', error);
      setError('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/admin/users'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        setError('คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้ - ต้องเป็น Admin เท่านั้น');
      } else {
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(getApiUrl(`api/admin/users/${userId}/role`), 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // อัปเดตข้อมูลใน state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      alert('อัปเดตสิทธิ์ผู้ใช้สำเร็จ');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสิทธิ์');
    }
  };

  // ===== Products Management Functions =====
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/admin/products'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    }
  };

  const saveProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? getApiUrl(`api/admin/products/${editingProduct.id}`)
        : getApiUrl('api/admin/products');
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url,
        data: productData,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(editingProduct ? 'อัปเดตสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ');
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกสินค้า');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(getApiUrl(`api/admin/products/${productId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('ลบสินค้าสำเร็จ');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  const updateProductStock = async (productId, action, quantity) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(getApiUrl(`api/admin/products/${productId}/stock`), 
        { action, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('อัปเดตจำนวนสินค้าสำเร็จ');
      fetchProducts();
    } catch (error) {
      console.error('Error updating product stock:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า');
    }
  };

  // ===== Orders Management Functions =====
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/admin/orders'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(getApiUrl(`api/admin/orders/${orderId}/status`), 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert('อัปเดตสถานะคำสั่งซื้อสำเร็จ');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl(`api/admin/orders/${order.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(response.data);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // ฟังก์ชันสำหรับดึงรูปภาพจากโฟลเดอร์ public/images/products
  const getProductImage = (product) => {
    if (product.model) {
      // ใช้รหัสสินค้า (model) เป็นชื่อไฟล์รูป .jpg
      return `/images/products/${product.model}.jpg`;
    }
    return '';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading">กำลังโหลดข้อมูลผู้ใช้...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'ADMIN') {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="error-message">
            <i className="fas fa-lock" style={{fontSize: '3rem', marginBottom: '20px', color: '#dc3545'}}></i>
            <h2>เข้าถึงไม่ได้</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="btn btn-primary"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>แดชบอร์ดผู้ดูแลระบบ</h1>
          <p>จัดการข้อมูลผู้ใช้ สินค้า และคำสั่งซื้อ</p>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i> จัดการผู้ใช้
          </button>
          <button 
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              fetchProducts();
            }}
          >
            <i className="fas fa-box"></i> จัดการสินค้า
          </button>
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              fetchOrders();
            }}
          >
            <i className="fas fa-shopping-cart"></i> จัดการคำสั่งซื้อ
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => {
              if (activeTab === 'users') fetchUsers();
              else if (activeTab === 'products') fetchProducts();
              else if (activeTab === 'orders') fetchOrders();
            }} className="btn btn-primary">
              ลองใหม่
            </button>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="dashboard-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="ค้นหาผู้ใช้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="sort-controls">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="createdAt">เรียงตามวันที่สมัคร</option>
                  <option value="name">เรียงตามชื่อ</option>
                  <option value="email">เรียงตามอีเมล</option>
                  <option value="role">เรียงตามสิทธิ์</option>
                </select>
                
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="sort-select"
                >
                  <option value="desc">ใหม่ → เก่า</option>
                  <option value="asc">เก่า → ใหม่</option>
                </select>
              </div>
            </div>

            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{users.length}</h3>
                  <p>ผู้ใช้ทั้งหมด</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon admin-icon">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="stat-content">
                  <h3>{users.filter(user => user.role === 'ADMIN').length}</h3>
                  <p>ผู้ดูแลระบบ</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon user-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="stat-content">
                  <h3>{users.filter(user => user.role === 'USER').length}</h3>
                  <p>ผู้ใช้ทั่วไป</p>
                </div>
              </div>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>ชื่อ</th>
                    <th>อีเมล</th>
                    <th>สิทธิ์</th>
                    <th>เบอร์โทร</th>
                    <th>ที่อยู่</th>
                    <th>วันที่สมัคร</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            <i className="fas fa-user"></i>
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div className="role-badge">
                          <span className={`role ${user.role.toLowerCase()}`}>
                            {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                          </span>
                        </div>
                      </td>
                      <td>{user.phone || '-'}</td>
                      <td className="address-cell">
                        {user.address ? (
                          user.address.length > 30 
                            ? `${user.address.substring(0, 30)}...` 
                            : user.address
                        ) : '-'}
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <select 
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="role-select"
                          >
                            <option value="USER">ผู้ใช้ทั่วไป</option>
                            <option value="ADMIN">ผู้ดูแลระบบ</option>
                          </select>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => window.open(`mailto:${user.email}`)}
                            title="ส่งอีเมล"
                          >
                            <i className="fas fa-envelope"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => navigator.clipboard.writeText(user.email)}
                            title="คัดลอกอีเมล"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sortedUsers.length === 0 && (
                <div className="no-data">
                  <i className="fas fa-users"></i>
                  <p>ไม่พบข้อมูลผู้ใช้</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-management">
            <div className="section-header">
              <h2>จัดการสินค้า</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
              >
                <i className="fas fa-plus"></i> เพิ่มสินค้าใหม่
              </button>
            </div>
            
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>รูปภาพ</th>
                    <th>ชื่อสินค้า</th>
                    <th>รุ่น</th>
                    <th>ราคา</th>
                    <th>หมวดหมู่</th>
                    <th>สต็อก</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {getProductImage(product) && (
                          <img 
                            src={getProductImage(product)} 
                            alt={product.name}
                            className="product-thumbnail"
                          />
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.model}</td>
                      <td>฿{parseFloat(product.price).toLocaleString()}</td>
                      <td>{product.category}</td>
                      <td>
                        <div className="stock-controls">
                          <span className="stock-amount">{product.stock}</span>
                          <div className="stock-buttons">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                const quantity = prompt('เพิ่มจำนวนสินค้า:');
                                if (quantity && !isNaN(quantity)) {
                                  updateProductStock(product.id, 'increase', parseInt(quantity));
                                }
                              }}
                              title="เพิ่มสต็อก"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => {
                                const quantity = prompt('ลดจำนวนสินค้า:');
                                if (quantity && !isNaN(quantity)) {
                                  updateProductStock(product.id, 'decrease', parseInt(quantity));
                                }
                              }}
                              title="ลดสต็อก"
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => {
                                const quantity = prompt('ตั้งจำนวนสินค้า:');
                                if (quantity && !isNaN(quantity)) {
                                  updateProductStock(product.id, 'set', parseInt(quantity));
                                }
                              }}
                              title="ตั้งสต็อก"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setEditingProduct(product);
                              setShowProductForm(true);
                            }}
                            title="แก้ไข"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteProduct(product.id)}
                            title="ลบ"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {products.length === 0 && (
                <div className="no-data">
                  <i className="fas fa-box"></i>
                  <p>ไม่พบข้อมูลสินค้า</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-management">
            <div className="section-header">
              <h2>จัดการคำสั่งซื้อ</h2>
            </div>
            
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>หมายเลขคำสั่งซื้อ</th>
                    <th>ลูกค้า</th>
                    <th>ยอดรวม</th>
                    <th>สถานะ</th>
                    <th>วันที่สั่งซื้อ</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <div className="customer-info">
                          <div>{order.user.name}</div>
                          <div className="email">{order.user.email}</div>
                        </div>
                      </td>
                      <td>฿{parseFloat(order.total).toLocaleString()}</td>
                      <td>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="PENDING">รอดำเนินการ</option>
                          <option value="CONFIRMED">ยืนยันแล้ว</option>
                          <option value="SHIPPED">จัดส่งแล้ว</option>
                          <option value="DELIVERED">ส่งมอบแล้ว</option>
                          <option value="CANCELLED">ยกเลิก</option>
                        </select>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => viewOrderDetails(order)}
                          title="ดูรายละเอียด"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && (
                <div className="no-data">
                  <i className="fas fa-shopping-cart"></i>
                  <p>ไม่พบข้อมูลคำสั่งซื้อ</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm 
            product={editingProduct}
            onSave={saveProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder}
            getProductImage={getProductImage}
            onClose={() => {
              setShowOrderDetails(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    model: product?.model || '',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    image: product?.image || '',
    category: product?.category || '',
    description: product?.description || '',
    stock: product?.stock || 0,
    rating: product?.rating || 0,
    reviews: product?.reviews || 0,
    isBestSeller: product?.isBestSeller || false,
    isOnSale: product?.isOnSale || false,
    discount: product?.discount || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
          <button onClick={onCancel} className="close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>ชื่อสินค้า *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>รุ่น *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>ราคา *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>ราคาเดิม</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>รูปภาพ (URL) *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>หมวดหมู่ *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>สต็อก</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>รายละเอียด *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              required
            />
          </div>
          
          <div className="form-checkboxes">
            <label>
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})}
              />
              สินค้าขายดี
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.isOnSale}
                onChange={(e) => setFormData({...formData, isOnSale: e.target.checked})}
              />
              กำลังลดราคา
            </label>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'อัปเดต' : 'เพิ่ม'} สินค้า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, getProductImage }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content order-details-modal">
        <div className="modal-header">
          <h3>รายละเอียดคำสั่งซื้อ #{order.id}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="order-details-content">
          <div className="order-info">
            <h4>ข้อมูลลูกค้า</h4>
            <p><strong>ชื่อ:</strong> {order.user.name}</p>
            <p><strong>อีเมล:</strong> {order.user.email}</p>
            <p><strong>เบอร์โทร:</strong> {order.user.phone || '-'}</p>
            <p><strong>ที่อยู่:</strong> {order.user.address || '-'}</p>
          </div>
          
          <div className="order-items">
            <h4>รายการสินค้า</h4>
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>รูปภาพ</th>
                  <th>ชื่อสินค้า</th>
                  <th>รุ่น</th>
                  <th>ราคา</th>
                  <th>จำนวน</th>
                  <th>รวม</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {getProductImage(item.product) && (
                        <img 
                          src={getProductImage(item.product)} 
                          alt={item.product.name}
                          className="order-item-thumbnail"
                        />
                      )}
                    </td>
                    <td>{item.product.name}</td>
                    <td>{item.product.model}</td>
                    <td>฿{parseFloat(item.price).toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td>฿{(parseFloat(item.price) * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="order-summary">
            <h4>สรุปคำสั่งซื้อ</h4>
            <p><strong>ยอดรวม:</strong> ฿{parseFloat(order.total).toLocaleString()}</p>
            <p><strong>สถานะ:</strong> 
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status === 'PENDING' && 'รอดำเนินการ'}
                {order.status === 'CONFIRMED' && 'ยืนยันแล้ว'}
                {order.status === 'SHIPPED' && 'จัดส่งแล้ว'}
                {order.status === 'DELIVERED' && 'ส่งมอบแล้ว'}
                {order.status === 'CANCELLED' && 'ยกเลิก'}
              </span>
            </p>
            <p><strong>วันที่สั่งซื้อ:</strong> {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-primary">ปิด</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
