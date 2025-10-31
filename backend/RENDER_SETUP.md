# 🔧 คู่มือตั้งค่า Render สำหรับ Backend

## ⚠️ ปัญหาที่พบ: 500 Internal Server Error

หาก backend ได้ 500 error อยู่เรื่อยๆ ให้ตรวจสอบตามขั้นตอนนี้:

## ✅ Checklist การตั้งค่าใน Render

### 1. Environment Variables (สำคัญมาก!)

ไปที่ **Render Dashboard** → **Backend Service** → **Environment**

**ต้องตั้งค่าอย่างน้อย:**
```
DATABASE_URL=mysql://user:password@host:port/database
```

**ตัวอย่าง:**
```
DATABASE_URL=mysql://root:password123@aws.connect.psdb.cloud:3306/furniture_office?sslaccept=strict
```

**Optional (แนะนำ):**
```
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

### 2. Build Command

ใน Render Dashboard → Settings → Build Command:
```
npm install && npm run build
```

**หรือ**
```
npm install && prisma generate && npm run build
```

### 3. Start Command

ใน Render Dashboard → Settings → Start Command:
```
npm start
```

**หรือ**
```
node dist/server.js
```

### 4. ตรวจสอบ Build Logs

หลัง deploy ให้ดู build logs ว่ามี error หรือไม่:
- ✅ ควรเห็น: `prisma generate` สำเร็จ
- ✅ ควรเห็น: `tsc -p tsconfig.json` สำเร็จ
- ❌ ถ้าเห็น error → แก้ไขตาม error message

### 5. ตรวจสอบ Runtime Logs

หลัง server start ให้ดู runtime logs:
- ✅ ควรเห็น: `✅ Database connected successfully`
- ❌ ถ้าเห็น: `❌ Database connection failed` → ตรวจสอบ DATABASE_URL

## 🔍 วิธีตรวจสอบ DATABASE_URL

### ถ้าใช้ PlanetScale:
1. ไปที่ PlanetScale Dashboard
2. เลือก database
3. คลิก "Connect"
4. เลือก "Prisma"
5. Copy connection string
6. วางใน Render Environment Variables

### ถ้าใช้ MySQL อื่น:
Format: `mysql://username:password@host:port/database`

ตัวอย่าง:
```
mysql://admin:MyPassword123@mysql.example.com:3306/furniture_office
```

## 🚀 ขั้นตอน Deploy ที่ถูกต้อง

### 1. ตั้งค่า Environment Variables ก่อน
**สำคัญมาก!** ต้องตั้งก่อน deploy

### 2. Manual Deploy
1. ไปที่ Render Dashboard → Backend Service
2. คลิก **"Manual Deploy"**
3. เลือก **"Deploy latest commit"**
4. รอ deploy เสร็จ

### 3. ตรวจสอบ Logs
1. ไปที่ **"Logs"** tab
2. ดู error messages
3. ตรวจสอบ database connection

## ❌ ปัญหาที่พบบ่อย

### 1. Database Connection Failed
**สาเหตุ:** DATABASE_URL ไม่ถูกต้องหรือไม่มี

**แก้ไข:**
- ตรวจสอบ DATABASE_URL ใน Environment Variables
- ตรวจสอบว่า database service ทำงานอยู่หรือไม่

### 2. Prisma Client Not Generated
**สาเหตุ:** Build script ไม่มี `prisma generate`

**แก้ไข:**
- ตรวจสอบ build logs
- ตรวจสอบ package.json → build script

### 3. 500 Error แต่ Logs ไม่มีอะไร
**สาเหตุ:** Code crash ก่อนที่จะ log

**แก้ไข:**
- ตรวจสอบ TypeScript compilation errors
- ตรวจสอบ import errors
- ตรวจสอบ runtime errors ใน logs

## 📋 Quick Fix Checklist

- [ ] DATABASE_URL ตั้งค่าแล้วใน Render Environment Variables
- [ ] Build Command ถูกต้อง: `npm install && npm run build`
- [ ] Start Command ถูกต้อง: `npm start`
- [ ] Backend service redeploy แล้ว
- [ ] ตรวจสอบ logs แล้วว่า database connected
- [ ] ตรวจสอบ logs แล้วว่าไม่มี compilation errors

## 🆘 หากยังมีปัญหา

1. **ดู Render Logs** → ค้นหาคำว่า "error" หรือ "failed"
2. **ตรวจสอบ DATABASE_URL** → ทดสอบ connection string
3. **ตรวจสอบ Build Logs** → ดู compilation errors
4. **Manual Deploy อีกครั้ง** → เพื่อให้แน่ใจว่าใช้ code ล่าสุด

