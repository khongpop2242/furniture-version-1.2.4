# 🔧 คู่มือแก้ไข Error สำหรับ Production

## ปัญหาที่พบ: 500 Internal Server Error

### สาเหตุที่เป็นไปได้:

1. **Prisma Client ไม่ได้ Generate**
2. **Database Connection Failed**
3. **Missing Environment Variables**
4. **Schema Mismatch**

## ✅ ขั้นตอนแก้ไข

### 1. ตรวจสอบ Build Script
Build script ต้องมี `prisma generate`:
```json
{
  "build": "prisma generate && tsc -p tsconfig.json"
}
```

### 2. ตรวจสอบ Environment Variables ใน Render
ใน Render Dashboard → Backend Service → Environment:

**ต้องมี:**
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret key สำหรับ JWT (แนะนำ)
- `PORT` - Render จะตั้งให้อัตโนมัติ

**Optional:**
- `EMAIL_USER` - สำหรับส่งอีเมล
- `EMAIL_PASS` - สำหรับส่งอีเมล
- `STRIPE_SECRET_KEY` - สำหรับ payment

### 3. ตรวจสอบ Database Connection
หลัง deploy ตรวจสอบ logs:
- ควรเห็น: `✅ Database connected successfully`
- ถ้าเห็น: `❌ Database connection failed` → ตรวจสอบ DATABASE_URL

### 4. Manual Deploy
1. ไปที่ Render Dashboard → Backend Service
2. คลิก "Manual Deploy" → "Deploy latest commit"
3. รอ deploy เสร็จ
4. ตรวจสอบ logs

### 5. ตรวจสอบ Prisma Schema
ให้แน่ใจว่า schema ตรงกับ database:
```bash
# ใน Render shell หรือ local
cd backend
npx prisma db push
npx prisma generate
```

## 🔍 Debug Steps

### ตรวจสอบ Logs:
1. ไปที่ Render Dashboard → Backend → Logs
2. ลอง Login/Register
3. ดู error messages:
   - `P1001` / `P1002` → Database connection issue
   - `P2002` → Duplicate entry
   - Other → ดู stack trace

### ทดสอบ Database:
```bash
# Test connection (ใน Render shell)
cd backend
node scripts/test-connection.js
```

## ✅ Checklist สำหรับ Production

- [ ] `DATABASE_URL` ตั้งค่าแล้ว
- [ ] `JWT_SECRET` ตั้งค่าแล้ว (optional แต่แนะนำ)
- [ ] Build script มี `prisma generate`
- [ ] Database connected successfully (ดูใน logs)
- [ ] Prisma schema sync กับ database แล้ว
- [ ] Backend deploy สำเร็จแล้ว

## 📞 หากยังมีปัญหา

1. ตรวจสอบ Render Logs → ดู error details
2. ตรวจสอบ Database → เช็ค connection
3. ตรวจสอบ Environment Variables → ต้องครบถ้วน
4. ลอง Manual Deploy → เพื่อให้แน่ใจว่าใช้ code ล่าสุด

