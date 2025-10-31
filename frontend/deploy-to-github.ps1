# สคริปต์สำหรับ push code ขึ้น GitHub repository
# https://github.com/khongpop2242/kaokai-frontend.git

Write-Host "=== ตั้งค่า Git Repository สำหรับ Kaokai Frontend ===" -ForegroundColor Green

# ตรวจสอบว่ามี git หรือยัง
if (-not (Test-Path .git)) {
    Write-Host "กำลัง initialize git repository..." -ForegroundColor Yellow
    git init
}

# ตรวจสอบว่า remote มีอยู่แล้วหรือยัง
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "Remote repository ที่มีอยู่: $remoteUrl" -ForegroundColor Cyan
    $changeRemote = Read-Host "ต้องการเปลี่ยน remote URL เป็น https://github.com/khongpop2242/kaokai-frontend.git? (y/n)"
    if ($changeRemote -eq "y" -or $changeRemote -eq "Y") {
        git remote set-url origin https://github.com/khongpop2242/kaokai-frontend.git
        Write-Host "อัปเดต remote URL แล้ว" -ForegroundColor Green
    }
} else {
    Write-Host "เพิ่ม remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/khongpop2242/kaokai-frontend.git
}

# เพิ่มไฟล์ทั้งหมด
Write-Host "`nกำลังเพิ่มไฟล์ทั้งหมด..." -ForegroundColor Yellow
git add .

# ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
$status = git status --porcelain
if ($status) {
    Write-Host "`nกำลัง commit ไฟล์..." -ForegroundColor Yellow
    git commit -m "Initial commit: Kaokai Furniture Frontend with backend API integration"
    Write-Host "Commit สำเร็จ!" -ForegroundColor Green
    
    Write-Host "`nกำลัง push ไปยัง GitHub..." -ForegroundColor Yellow
    Write-Host "หมายเหตุ: อาจต้องใส่ username และ token สำหรับ authentication" -ForegroundColor Cyan
    
    # ลอง push
    git branch -M main
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Push สำเร็จ! Repository พร้อมสำหรับ Vercel deployment" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Push ไม่สำเร็จ กรุณาตรวจสอบ authentication" -ForegroundColor Yellow
        Write-Host "วิธีแก้: ใช้ Personal Access Token แทน password เมื่อ push" -ForegroundColor Cyan
    }
} else {
    Write-Host "`nไม่มีการเปลี่ยนแปลงที่ต้อง commit" -ForegroundColor Yellow
    
    # ตรวจสอบว่ามี commit แล้วหรือยัง
    $commitCount = (git rev-list --count HEAD 2>$null)
    if ($commitCount -eq 0) {
        Write-Host "ยังไม่มี commit ใดๆ กำลังสร้าง initial commit..." -ForegroundColor Yellow
        git commit -m "Initial commit: Kaokai Furniture Frontend with backend API integration" --allow-empty
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
Write-Host "Repository URL: https://github.com/khongpop2242/kaokai-frontend" -ForegroundColor Cyan

