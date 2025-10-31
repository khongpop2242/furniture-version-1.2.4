// API Configuration
// ใช้ environment variable สำหรับ API URL
// ใน production (Vercel) จะใช้ backend URL จาก environment variable หรือ default
// ใน development สามารถ override ด้วย REACT_APP_API_URL

const API_URL = 
  process.env.REACT_APP_API_URL || 
  'https://kaokai-backend.onrender.com'; // default สำหรับ production

export default API_URL;

// Helper function สำหรับสร้าง full URL
export const getApiUrl = (endpoint) => {
  // ถ้า endpoint เริ่มต้นด้วย http:// หรือ https:// ให้ใช้ตามนั้น
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // ลบ leading slash ถ้ามี
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // รวม API_URL กับ endpoint
  return `${API_URL}/${cleanEndpoint}`;
};

