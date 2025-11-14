# Thư mục Fonts cho PDF

## Cách thêm font Arial Unicode MS

### Tự động (Khuyến nghị)
Chạy script PowerShell:
```powershell
.\setup-font.ps1
```

### Thủ công

1. **Tìm font Arial Unicode MS trên Windows:**
   - Thường có tại: `C:\Windows\Fonts\ARIALUNI.TTF`
   - Hoặc trong Office: `C:\Program Files\Microsoft Office\root\Fonts\ARIALUNI.TTF`

2. **Copy font vào thư mục này:**
   ```bash
   copy "C:\Windows\Fonts\ARIALUNI.TTF" "src\assets\fonts\ArialUnicodeMS.ttf"
   ```

3. **Hoặc sử dụng font miễn phí:**
   - Tải Noto Sans từ: https://fonts.google.com/noto/specimen/Noto+Sans
   - Copy `NotoSans-Regular.ttf` → `ArialUnicodeMS.ttf`

## Lưu ý

- Font sẽ được tự động load khi generate PDF
- Nếu không có font, sẽ fallback về Helvetica (có lỗi tiếng Việt)
- Kiểm tra console để xem font đã load chưa

