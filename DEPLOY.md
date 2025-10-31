# 📤 คู่มือการ Deploy โปรเจกต์ Kaokai Furniture

## 🚀 Deploy Frontend บน Vercel

### ขั้นตอนที่ 1: Push โค้ดขึ้น GitHub

1. **เปิด PowerShell หรือ Terminal** ในโฟลเดอร์โปรเจกต์

2. **รันสคริปต์ deploy:**
```powershell
.\deploy-to-github.ps1
```

หรือทำแบบ manual:

```bash
# ตรวจสอบว่า git ถูกตั้งค่าแล้วหรือยัง
git init

# เพิ่ม remote repository
git remote add origin https://github.com/khongpop2242/kaokai-frontend.git

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit: Kaokai Furniture Full Stack Application"

# Push ขึ้น GitHub
git branch -M main
git push -u origin main
```

**หมายเหตุ**: เมื่อ push ครั้งแรก Git จะขอ username และ password
- Username: ใส่ GitHub username ของคุณ
- Password: **ใช้ Personal Access Token** แทน password
- สร้าง token ได้ที่: https://github.com/settings/tokens
  - เลือก scope: `repo` (Full control of private repositories)

### ขั้นตอนที่ 2: Deploy บน Vercel

1. **ไปที่ https://vercel.com** และลงทะเบียน/เข้าสู่ระบบ

2. **คลิก "New Project"** หรือ "Add New..." > "Project"

3. **Import Git Repository**:
   - เลือก GitHub repository: `kaokai-frontend`
   - หรือใส่ URL: `https://github.com/khongpop2242/kaokai-frontend`

4. **ตั้งค่า Project Settings**:
   ```
   Framework Preset: React
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

5. **Environment Variables** (ถ้าต้องการ override):
   - `REACT_APP_API_URL` (ไม่จำเป็น - มี default เป็น https://kaokai-backend.onrender.com)

6. **คลิก "Deploy"**

7. **รอให้ build เสร็จ** - Vercel จะแสดง URL ของเว็บไซต์

### 📋 Checklist ก่อน Deploy

- [x] โค้ดทั้งหมดถูก commit แล้ว
- [x] Push ขึ้น GitHub สำเร็จ
- [x] `frontend/src/config/api.js` ตั้งค่า backend URL ถูกต้อง
- [x] ไม่มี hardcoded localhost URLs
- [x] `.gitignore` ถูกตั้งค่าถูกต้อง (ไม่ push node_modules)

## 🔧 การตั้งค่า Backend

Backend API ควรจะ deploy แยก (เช่น บน Render, Railway, Heroku)

### Backend API URL

Frontend จะเชื่อมต่อกับ backend อัตโนมัติที่:
- **Production**: `https://kaokai-backend.onrender.com`
- **Development**: Override ด้วย `REACT_APP_API_URL` environment variable

## 🌐 URLs หลัง Deploy

หลังจาก deploy สำเร็จ:

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://kaokai-backend.onrender.com`

## 📝 หมายเหตุ

- Vercel จะ deploy frontend อัตโนมัติทุกครั้งที่ push code ขึ้น GitHub
- Backend ควร deploy แยกบน Render หรือบริการอื่น
- ตรวจสอบว่า backend API ทำงานอยู่ก่อน deploy frontend

## 🆘 Troubleshooting

### ปัญหา: Build ล้มเหลว
- ตรวจสอบว่า Root Directory ตั้งเป็น `frontend`
- ตรวจสอบ Build Command และ Output Directory

### ปัญหา: API ไม่เชื่อมต่อ
- ตรวจสอบว่า backend API ทำงานอยู่
- ตรวจสอบ CORS settings ใน backend
- ตรวจสอบ environment variables ใน Vercel

### ปัญหา: Authentication Error เมื่อ Push
- ใช้ Personal Access Token แทน password
- ตรวจสอบ token มีสิทธิ์ `repo` scope

