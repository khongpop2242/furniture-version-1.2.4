-- ลบรูปจากสินค้า ID 2 (ตู้เอกสารสูง)
UPDATE products SET image = NULL WHERE id = 2;

-- ตรวจสอบผลลัพธ์
SELECT id, name, image FROM products WHERE id = 2;
