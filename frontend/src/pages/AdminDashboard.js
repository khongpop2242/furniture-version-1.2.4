import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

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
      const response = await axios.get('http://localhost:5000/api/auth/me', {
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
      const response = await axios.get('http://localhost:5000/api/admin/users', {
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
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, 
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
          <p>จัดการข้อมูลผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchUsers} className="btn btn-primary">
              ลองใหม่
            </button>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default AdminDashboard;
