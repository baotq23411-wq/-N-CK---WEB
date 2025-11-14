# Script tu dong setup font Arial Unicode MS cho PDF
# Chay: .\setup-font.ps1

Write-Host "Dang tim font Arial Unicode MS..." -ForegroundColor Cyan

# Cac duong dan co the co font
$fontPaths = @(
    "C:\Windows\Fonts\ARIALUNI.TTF",
    "C:\Windows\Fonts\Arial Unicode MS.ttf",
    "$env:LOCALAPPDATA\Microsoft\Windows\Fonts\ARIALUNI.TTF",
    "$env:ProgramFiles\Microsoft Office\root\Fonts\ARIALUNI.TTF"
)

$fontFound = $false
$fontPath = $null

foreach ($path in $fontPaths) {
    if (Test-Path $path) {
        $fontPath = $path
        $fontFound = $true
        Write-Host "Tim thay font tai: $path" -ForegroundColor Green
        break
    }
}

if (-not $fontFound) {
    Write-Host "Khong tim thay font Arial Unicode MS tren he thong." -ForegroundColor Red
    Write-Host ""
    Write-Host "Giai phap:" -ForegroundColor Yellow
    Write-Host "   1. Tai font tu: https://fonts.google.com/noto/specimen/Noto+Sans"
    Write-Host "   2. Copy file NotoSans-Regular.ttf vao: src\assets\fonts\ArialUnicodeMS.ttf"
    Write-Host "   3. Hoac cai dat Microsoft Office (co kem Arial Unicode MS)"
    Write-Host ""
    exit 1
}

# Tao thu muc fonts neu chua co
$targetDir = "src\assets\fonts"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Da tao thu muc: $targetDir" -ForegroundColor Green
}

# Copy font
$targetFile = Join-Path $targetDir "ArialUnicodeMS.ttf"
try {
    Copy-Item -Path $fontPath -Destination $targetFile -Force
    Write-Host "Da copy font vao: $targetFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "Hoan tat! Font da duoc setup thanh cong." -ForegroundColor Green
    Write-Host "   PDF hoa don se hien thi dung tieng Viet." -ForegroundColor Green
}
catch {
    Write-Host "Loi khi copy font: $_" -ForegroundColor Red
    exit 1
}

