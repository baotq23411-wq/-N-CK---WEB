import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SEOService } from '../services/seo.service';

@Component({
  selector: 'app-banking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banking.html',
  styleUrls: ['./banking.css']
})
export class Banking implements OnInit {
  booking: any;
  bookings: any[] = []; // 🟩 ADDED: Mảng các bookings
  customer: any;
  totalPrice: number = 0;
  originalPrice: number = 0;
  roomPrice: number = 0;
  qrCodeUrl: string = '';
  expiredAt: Date = new Date();
  merchantName = 'Panacea Việt Nam';
  timeLeft = '15:00';
  rewardPoints = 0;
  discountValue: number = 0;
  promoCode: string = '';

  // 🟩 ADDED: Dịch vụ
  expertServices: any[] = [];
  extraServices: any[] = [];
  
  // 🟩 ADDED: Redeem Xu
  usePoints: boolean = false;
  pointsDiscountValue: number = 0;

  bookingDate: string = '';
  checkInTime: string = '';
  checkOutTime: string = '';

  headerSteps = [
    { id: 1, name: 'Xem lại' },
    { id: 2, name: 'Thanh toán' }
  ];
  currentStep = 2;

  constructor(
    private router: Router,
    private seoService: SEOService
  ) {}

  ngOnInit(): void {
    // SEO
    this.seoService.updateSEO({
      title: 'Thanh Toán Ngân Hàng - Panacea',
      description: 'Thanh toán qua ngân hàng tại Panacea - Hỗ trợ nhiều ngân hàng trong nước và quốc tế.',
      keywords: 'Thanh toán ngân hàng Panacea, banking Panacea, chuyển khoản Panacea',
      robots: 'noindex, nofollow'
    });
    
    // 🟩 ADDED: Scroll to top khi vào trang
    window.scrollTo(0, 0);
    
    this.loadBookingData();
  }

  loadBookingData(): void {
    // 🟩 UPDATED: Đọc dữ liệu từ localStorage (từ payment)
    const bankingDataStr = localStorage.getItem('bankingData');
    
    if (bankingDataStr) {
      try {
        const bankingData = JSON.parse(bankingDataStr);
        
        // Lấy dữ liệu từ bankingData
        this.bookings = bankingData.bookings || [];
        this.booking = this.bookings.length > 0 ? this.bookings[0] : null;
        
        // 🟩 UPDATED: Xử lý customer data (có thể là từ currentUser hoặc contactForm)
        const customerData = bankingData.customer || {};
        this.customer = {
          fullName: customerData.full_name || 
                    (customerData.lastName && customerData.firstName ? `${customerData.lastName} ${customerData.firstName}` : '') ||
                    customerData.fullName ||
                    customerData.ten ||
                    'N/A',
          email: customerData.email || 'N/A',
          phone: customerData.phone_number || customerData.phone || 'N/A'
        };
        
        this.expertServices = bankingData.expertServices || [];
        this.extraServices = bankingData.extraServices || [];
        this.totalPrice = bankingData.totalPrice || 0;
        this.originalPrice = bankingData.originalPrice || 0;
        this.discountValue = bankingData.discountValue || 0;
        this.rewardPoints = bankingData.rewardPoints || 0;
        this.promoCode = bankingData.promoCode || '';
        // 🟩 ADDED: Lưu thông tin Redeem Xu
        this.usePoints = bankingData.usePoints || false;
        this.pointsDiscountValue = bankingData.pointsDiscountValue || 0;
        this.qrCodeUrl = bankingData.qrCodeUrl || 'assets/img/vietqr-sample.webp';
        
        // Tính giá phòng từ booking đầu tiên
        if (this.booking) {
          this.roomPrice = this.booking.basePrice || this.booking.room?.price || 0;
          
          // Lấy thông tin ngày giờ từ booking
          if (this.booking.checkInDate) {
            const dateObj = new Date(this.booking.checkInDate);
            this.bookingDate = dateObj.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
          
          this.checkInTime = this.booking.checkInTime || '';
          this.checkOutTime = this.booking.checkOutTime || '';
        }
        
        // ✅ Hạn thanh toán (15 phút)
        const now = new Date();
        this.expiredAt = new Date(now.getTime() + 15 * 60000);
        this.startCountdown(15 * 60);
        
      } catch (error) {
        console.error('Lỗi khi parse bankingData:', error);
        // Fallback: thử load từ bookings.json
        this.loadBookingDataFallback('BK001');
      }
    } else {
      // Fallback: thử load từ bookings.json nếu không có dữ liệu từ payment
      this.loadBookingDataFallback('BK001');
    }
  }
  
  // Fallback: Load từ bookings.json (nếu không có dữ liệu từ payment)
  async loadBookingDataFallback(id: string) {
    try {
      const response = await fetch('/assets/data/bookings.json');
      if (!response.ok) throw new Error('Không thể tải file bookings.json');
      const data = await response.json();
      const found = data.find((b: any) => b.id === id);

      if (found) {
        this.booking = found;
        this.bookings = [found];

        // ✅ Gán thông tin khách hàng
        this.customer = {
          fullName: found.customerName,
          email: found.customerEmail,
          phone: found.customerPhone
        };

        // ✅ Giờ nhận / trả
        if (found.startTime && found.endTime) {
          this.checkInTime = found.startTime.split(' ')[0];
          this.checkOutTime = found.endTime.split(' ')[0];
        }

        // ✅ Ngày
        const dateStr = found.startTime.split(' ')[1];
        const [day, month, year] = dateStr.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        this.bookingDate = dateObj.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        // ✅ Giá phòng (giá gốc / giờ)
        this.roomPrice = found.room?.pricePerHour ?? 0;

        // ✅ Tính giá trước & sau voucher
        if (found.discountValue && found.discountValue > 0) {
          this.originalPrice = (found.totalPrice ?? 0) + found.discountValue;
          this.totalPrice = found.totalPrice;
        } else {
          this.originalPrice = 0;
          this.totalPrice = found.totalPrice ?? 0;
        }

        // ✅ Tính Xu
        this.rewardPoints = found.rewardPointsEarned ?? Math.floor(this.totalPrice / 1000);

        // ✅ Ảnh QR mẫu
        this.qrCodeUrl = 'assets/img/vietqr-sample.webp';

        // ✅ Hạn thanh toán
        const now = new Date();
        this.expiredAt = new Date(now.getTime() + 15 * 60000);
        this.startCountdown(15 * 60);
      } else {
        console.error('Không tìm thấy booking ID:', id);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu booking:', error);
    }
  }

  get activeServices() {
    return this.booking?.services || [];
  }
  
  // 🟩 ADDED: Get số giờ của booking
  getBookingHours(booking: any): number {
    if (!booking || !booking.checkInTime || !booking.checkOutTime) return 1;
    const [startH, startM] = booking.checkInTime.split(':').map(Number);
    const [endH, endM] = booking.checkOutTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return Math.max(1, Math.ceil((endMinutes - startMinutes) / 60));
  }

  startCountdown(seconds: number) {
    let remaining = seconds;
    const timer = setInterval(() => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      this.timeLeft = `${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
      remaining--;
      if (remaining < 0) clearInterval(timer);
    }, 1000);
  }

  downloadQR() {
    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = 'vietqr-payment.webp';
    link.click();
  }

  navigateBack() {
    window.history.back();
  }

  navigateToPayment() {
    this.router.navigate(['/payment']);
  }
}
