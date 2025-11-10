import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banking.html',
  styleUrls: ['./banking.css']
})
export class Banking implements OnInit {
  booking: any;
  customer: any;
  totalPrice: number = 0;
  originalPrice: number = 0;
  roomPrice: number = 0; // ✅ giá phòng hiển thị ngay dưới "Số lượng"
  qrCodeUrl: string = '';
  expiredAt: Date = new Date();
  merchantName = 'Panacea Việt Nam';
  timeLeft = '15:00';
  rewardPoints = 0;

  bookingDate: string = '';
  checkInTime: string = '';
  checkOutTime: string = '';

  headerSteps = [
    { id: 1, name: 'Xem lại' },
    { id: 2, name: 'Thanh toán' }
  ];
  currentStep = 2;

  constructor() {}

  ngOnInit(): void {
    this.loadBookingData('BK001');
  }

  async loadBookingData(id: string) {
    try {
      const response = await fetch('/assets/data/bookings.json');
      if (!response.ok) throw new Error('Không thể tải file bookings.json');
      const data = await response.json();
      const found = data.find((b: any) => b.id === id);

      if (found) {
        this.booking = found;

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
        this.qrCodeUrl = 'assets/img/vietqr-sample.png';

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
    link.download = 'vietqr-payment.png';
    link.click();
  }

  navigateBack() {
    window.history.back();
  }
}
