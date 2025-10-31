# สคริปต์สำหรับ push ทั้งโปรเจกต์ขึ้น GitHub repository
# https://github.com/khongpop2242/kaokai-frontend.git

Write-Host "=== ตั้งค่า Git Repository สำหรับ Kaokai Furniture Project ===" -ForegroundColor Green

# ตรวจสอบว่ามี git หรือยัง
if (-not (Test-Path .git)) {
    Write-Host "กำลัง initialize git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository ถูกสร้างแล้ว" -ForegroundColor Green
} else {
    Write-Host "✅ พบ git repository อยู่แล้ว" -ForegroundColor Green
}

# ตรวจสอบว่า remote มีอยู่แล้วหรือยัง
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "`nRemote repository ที่มีอยู่: $remoteUrl" -ForegroundColor Cyan
    $changeRemote = Read-Host "ต้องการเปลี่ยน remote URL เป็น https://github.com/khongpop2242/kaokai-frontend.git? (y/n)"
    if ($changeRemote -eq "y" -or $changeRemote -eq "Y") {
        git remote set-url origin https://github.com/khongpop2242/kaokai-frontend.git
        Write-Host "✅ อัปเดต remote URL แล้ว" -ForegroundColor Green
    }
} else {
    Write-Host "`nกำลังเพิ่ม remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/khongpop2242/kaokai-frontend.git
    Write-Host "✅ เพิ่ม remote repository แล้ว" -ForegroundColor Green
}

# เพิ่มไฟล์ทั้งหมด (ยกเว้นที่อยู่ใน .gitignore)
Write-Host "`nกำลังเพิ่มไฟล์ทั้งหมด..." -ForegroundColor Yellow
git add .

# ตรวจสอบสถานะ
Write-Host "`nตรวจสอบสถานะไฟล์..." -ForegroundColor Yellow
git status --short

# ตรวจสอบว่ามีการเปลี่ยนแปลงที่ต้อง commit หรือไม่
$status = git status --porcelain
if ($status) {
    Write-Host "`nพบไฟล์ที่ต้อง commit" -ForegroundColor Cyan
    
    Write-Host "`nกำลัง commit ไฟล์..." -ForegroundColor Yellow
    git commit -m "Initial commit: Kaokai Furniture Full Stack Application

- Frontend: React app with backend API integration
- Backend: Node.js/Express API server
- Database: Prisma ORM with PostgreSQL
- Features: E-commerce, Payment (Stripe), Admin Dashboard
- Backend API: https://kaokai-backend.onrender.com"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit สำเร็จ!" -ForegroundColor Green
        
        Write-Host "`nกำลัง push ไปยัง GitHub..." -ForegroundColor Yellow
        Write-Host "หมายเหตุ: อาจต้องใส่ username และ Personal Access Token สำหรับ authentication" -ForegroundColor Cyan
        
        # ตั้งค่า branch เป็น main
        git branch -M main
        
        # Push ไปยัง GitHub
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅✅✅ Push สำเร็จ! ✅✅✅" -ForegroundColor Green
            Write-Host "`nRepository URL: https://github.com/khongpop2242/kaokai-frontend" -ForegroundColor Cyan
            Write-Host "`nคุณสามารถ deploy บน Vercel ได้แล้ว:" -ForegroundColor Yellow
            Write-Host "1. ไปที่ https://vercel.com" -ForegroundColor Cyan
            Write-Host "2. Import repository: kaokai-frontend" -ForegroundColor Cyan
            Write-Host "3. ตั้งค่า Root Directory เป็น: frontend" -ForegroundColor Cyan
            Write-Host "4. Vercel จะ deploy อัตโนมัติ" -ForegroundColor Cyan
        } else {
            Write-Host "`n⚠️ Push ไม่สำเร็จ กรุณาตรวจสอบ authentication" -ForegroundColor Yellow
            Write-Host "`nวิธีแก้ไข:" -ForegroundColor Cyan
            Write-Host "1. ใช้ Personal Access Token แทน password" -ForegroundColor White
            Write-Host "2. สร้าง token ที่: https://github.com/settings/tokens" -ForegroundColor White
            Write-Host "3. ใช้ token แทน password เมื่อ Git ขอ authentication" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️ Commit ไม่สำเร็จ" -ForegroundColor Yellow
    }
} else {
    Write-Host "`nไม่พบไฟล์ที่ต้อง commit" -ForegroundColor Yellow
    
    # ตรวจสอบว่ามี commit แล้วหรือยัง
    $hasCommits = git rev-parse --verify HEAD 2>$null
    if (-not $hasCommits) {
        Write-Host "ยังไม่มี commit ใดๆ กำลังสร้าง initial commit..." -ForegroundColor Yellow
        git commit -m "Initial commit: Kaokai Furniture Full Stack Application" --allow-empty
    }
    
    Write-Host "`nกำลัง push ไปยัง GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Push สำเร็จ!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Push ไม่สำเร็จ" -ForegroundColor Yellow
    }
}

Write-Host "`n=== เสร็จสิ้น ===" -ForegroundColor Green

