import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InvoiceService } from '../services/invoice';

// DB
import bookingData from '../../assets/data/bookings.json';
import voucherData from '../../assets/data/voucher.json';
import roomData from '../../assets/data/room.json';
import { ChangeDetectorRef } from '@angular/core';


import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localeVi);

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }]
})
export class Payment implements OnInit {
  currentUser: any;
  isLoggedIn = false;
  bookingForMe = true;

  // 🟩 ADDED: dùng cho checkbox "Tôi đặt phòng cho chính mình" trong HTML
  isSelfBooking: boolean = true;

  booking: any = null;
  roomInfo: any = null;
  vouchers: any[] = voucherData;

  header: any = null;
  headerSteps = [
    { id: 1, name: 'Xem lại' },
    { id: 2, name: 'Thanh toán' },
  ];
  currentStep = 1;

  basePrice = 0;
  totalPrice = 0;
  originalPrice = 0;
  discountValue = 0;
  discountMessage = '';

  showPriceDetails = false;
  promoCode = '';
  rewardPoints = 0;
  agreedRules = false;
  contactForm!: FormGroup;

  roomRules: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private thanhToanService: InvoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.loadRoomRules();
    // 🟩 ADDED: cập nhật validator theo trạng thái đăng nhập & checkbox
    this.updateContactValidators();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      saveInfo: [false],
    });
  }

  // 🟩 ADDED: parse "HH:mm DD/MM/YYYY" → Date
  private parseDateTime(str: string): { dateObj: Date, timeStr: string } {
    if (!str) return { dateObj: new Date(), timeStr: '' };
    const [timePart, datePart] = str.split(' ');
    if (!timePart || !datePart) return { dateObj: new Date(str), timeStr: '' };
    const [hour, minute] = timePart.split(':').map(Number);
    const [day, month, year] = datePart.split('/').map(Number);
    const d = new Date(year, month - 1, day, hour, minute);
    return { dateObj: d, timeStr: timePart };
  }

  loadData(): void {
    this.thanhToanService.getUser().subscribe({
      next: (res: any) => {
        this.currentUser = res;
        this.isLoggedIn = !!res?.ten;

        // 🟩 ADDED: nếu đã đăng nhập, tự động điền form theo user
        if (this.isLoggedIn && this.currentUser) {
          const fullName = this.currentUser.ten || '';
          const parts = fullName.trim().split(' ');
          const firstName = parts.pop() || '';
          const lastName = parts.join(' ');
          this.contactForm.patchValue({
            firstName,
            lastName,
            phone: this.currentUser.phone || '',
            email: this.currentUser.email || '',
          });
          // 🟩 ADDED: cập nhật lại validator sau khi biết trạng thái đăng nhập
          this.updateContactValidators();
        }
      },
      error: () => console.warn('Không thể tải user.json'),
    });

    // 🟩 CHỈNH: chọn đúng booking có id = "BK001"
    let selectedBooking = null;
    if (Array.isArray(bookingData)) {
      selectedBooking = bookingData.find((b: any) => b.id === 'BK002') || bookingData[0];
    } else {
      selectedBooking = bookingData;
    }
    this.booking = selectedBooking;
    if (!this.booking) return;

    // 🟩 ADDED: chuyển startTime / endTime → checkInDate / checkInTime / checkOutTime
    if (this.booking.startTime && this.booking.endTime) {
      const startParsed = this.parseDateTime(this.booking.startTime);
      const endParsed = this.parseDateTime(this.booking.endTime);
      this.booking.checkInDate = startParsed.dateObj;
      this.booking.checkInTime = startParsed.timeStr;
      this.booking.checkOutTime = endParsed.timeStr;
    }

    this.roomInfo = this.booking.room
      ? this.booking.room
      : (Array.isArray(roomData) ? roomData : [roomData]).find(
          (r: any) => String(r.id ?? r.roomId) === String(this.booking.roomId)
        );

    if (!this.roomInfo) return;

    this.header = {
      title: this.roomInfo.name ?? 'Đặt phòng',
      rating: this.roomInfo.rating ?? 0,
      reviews: this.roomInfo.reviews ?? 0,
    };

    this.basePrice = this.roomInfo.price ?? this.roomInfo.pricePerHour ?? 0;
    this.originalPrice = this.basePrice;
    this.totalPrice = this.basePrice;

    this.booking.services = (this.booking.services || []).map((s: any) => ({
      ...s,
      active: !!s.active,
    }));

    // 🟩 ADDED: tính ngày hủy / đổi miễn phí
    if (this.booking.checkInDate instanceof Date) {
      const cancelBefore = new Date(this.booking.checkInDate);
      cancelBefore.setDate(cancelBefore.getDate() - 1);
      this.booking.cancelBefore = cancelBefore;

      const rescheduleBefore = new Date(this.booking.checkInDate);
      rescheduleBefore.setDate(rescheduleBefore.getDate() - 1);
      this.booking.rescheduleBefore = rescheduleBefore;
    }

    if (this.booking.voucherCode) {
      this.promoCode = String(this.booking.voucherCode).trim();
      this.applyCoupon();
    }

    this.calculateTotal();
  }

  private combineDateTime(dateStr?: string, timeStr?: string): Date {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
    let hh = 0,
      mm = 0;
    if (timeStr && timeStr.includes(':')) {
      [hh, mm] = timeStr.split(':').map((v) => parseInt(v, 10));
    }
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  }

  loadRoomRules(): void {
    this.roomRules = [
      {
        icon: 'bi bi-heart-pulse',
        title: 'Sức khỏe',
        description: 'Người chơi cần đảm bảo sức khỏe ổn định trước khi tham gia.',
      },
      {
        icon: 'bi bi-person-plus-fill',
        title: 'Độ tuổi',
        description:
          'Trò chơi phù hợp cho người từ 16 tuổi trở lên. Dưới 16 cần có người lớn đi kèm.',
      },
      {
        icon: 'bi bi-shield-check',
        title: 'An toàn đạo cụ',
        description: 'Không phá hoại hoặc sử dụng lực mạnh lên đạo cụ trong phòng.',
      },
      {
        icon: 'bi bi-people-fill',
        title: 'Số lượng',
        description:
          'Mỗi phòng có giới hạn số người tham gia, vui lòng tuân thủ quy định.',
      },
    ];
  }

  toggleService(service: any): void {
    service.active = !service.active;
    this.calculateTotal();
  }
  get activeServices() {
    return (this.booking?.services || []).filter((s: any) => s.active);
  }

  calculateTotal(): void {
  // Tổng gốc: giá phòng + dịch vụ (chưa trừ voucher)
  const extras = (this.booking?.services || [])
    .filter((s: any) => s.active)
    .reduce((sum: number, s: any) => sum + (s.price ?? 0), 0);

  const preDiscount = (this.basePrice ?? 0) + extras;

  if (this.isCouponValid && this.discountValue > 0) {
    // Có voucher ➜ luôn hiển thị gạch giá gốc = tổng trước giảm
    this.originalPrice = preDiscount;

    let after = preDiscount - this.discountValue;
    if (after < 0) after = 0;
    this.totalPrice = after;
  } else {
    // Không có voucher ➜ không hiển thị giá gốc
    this.originalPrice = 0;
    this.totalPrice = preDiscount;
  }

  // Tính Xu
  this.rewardPoints = Math.round(this.totalPrice / 1000);

  // ✅ cập nhật view ngay lập tức
  this.cdr.detectChanges();
}



  isCouponValid: boolean = false;

  applyCoupon(): void {
  const code = (this.promoCode || '').trim().toUpperCase();

  // Reset trạng thái
  this.discountValue = 0;
  this.discountMessage = '';
  this.isCouponValid = false;

  // Nếu không nhập mã
  if (!code) {
    this.originalPrice = 0;
    this.calculateTotal();
    this.cdr.detectChanges(); // ✅ cập nhật ngay
    return;
  }

  // Tìm voucher
  const v = this.vouchers.find(
    (x: any) => String(x.code || '').toUpperCase() === code
  );

  if (!v) {
    this.discountMessage = 'Mã không hợp lệ';
    this.isCouponValid = false;
    this.originalPrice = 0;
    this.calculateTotal();
    this.cdr.detectChanges();
    return;
  }

  // ✅ Nếu là giảm phần trăm
  if (String(v.discountType || '').toLowerCase() === 'percent') {
    this.discountValue = (this.basePrice * (v.discountValue ?? 0)) / 100;
    if (v.maxDiscountAmount)
      this.discountValue = Math.min(this.discountValue, v.maxDiscountAmount);
    this.discountMessage = `Giảm ${v.discountValue}%`;
  } else {
    // ✅ Nếu là giảm theo số tiền
    this.discountValue = v.discountValue ?? 0;
    this.discountMessage = `Giảm ${this.discountValue.toLocaleString()} VND`;
  }

  // ✅ Cập nhật trạng thái
  this.isCouponValid = true;

  // ✅ Tính toán lại ngay lập tức
  this.calculateTotal();
  this.cdr.detectChanges(); // 🔥 cập nhật view ngay lập tức
}


  toggleAgree(e: any): void {
    this.agreedRules = !!e?.target?.checked;
  }

  // ===== Đăng nhập / Đăng ký Popup =====
  async openLoginPopup(event: any): Promise<void> {
    if (!event.target.checked) return;

    const loginHTML = `
     <div class="container-fluid px-3" style="max-width: 380px; margin: auto;">
  <h3 class="text-center fw-bold text-primary mb-2">
    <i class="bi bi-person-circle me-2"></i>Đăng nhập
  </h3>
  <p class="text-center text-muted small mb-3">
    Đăng nhập để lưu thông tin của bạn
  </p>

  <input id="login-email"
         class="form-control mb-3"
         placeholder="Email hoặc SĐT">

  <div class="position-relative mb-2">
    <input id="login-password" type="password"
           class="form-control pe-5"
           placeholder="Mật khẩu">
    <i id="toggle-pass"
       class="bi bi-eye-slash position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
       style="cursor: pointer;"></i>
  </div>

  <div class="text-end mb-3">
    <a href="#" id="forgot" class="small text-decoration-none text-primary">Quên mật khẩu?</a>
  </div>

  <hr class="my-3">

  <div class="text-center small">
    Chưa có tài khoản?
    <a href="#" id="register-link" class="fw-semibold text-warning text-decoration-none">Đăng ký ngay</a>
  </div>
</div>
    `;
    const popup = await Swal.fire({
      html: loginHTML,
      showConfirmButton: true,
      confirmButtonText: '<i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập',
      showCancelButton: true,
      cancelButtonText: 'Hủy',
      background: '#fff',
      width: '380px',
      color: '#333',
      customClass: { popup: 'shadow-lg rounded-4 border border-light' },
      didOpen: () => {
        const passInput = document.getElementById('login-password') as HTMLInputElement;
        const toggle = document.getElementById('toggle-pass') as HTMLElement;
        toggle.addEventListener('click', () => {
          const hidden = passInput.type === 'password';
          passInput.type = hidden ? 'text' : 'password';
          toggle.className = hidden ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
        document.getElementById('register-link')?.addEventListener('click', (e) => {
          e.preventDefault();
          Swal.close();
          this.openRegisterPopup(event);
        });
        document.getElementById('forgot')?.addEventListener('click', (e) => {
          e.preventDefault();
          Swal.fire({
            icon: 'info',
            title: 'Tính năng đang phát triển',
            text: 'Chức năng quên mật khẩu sẽ sớm được bổ sung!',
          });
        });
      },
      preConfirm: () => {
        const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('login-password') as HTMLInputElement).value.trim();
        if (!email || !password) {
          Swal.showValidationMessage('Vui lòng nhập đầy đủ thông tin!');
          return;
        }
        return { email, password };
      },
    });

    if (popup.value) {
      const { email, password } = popup.value;
      if (email === 'test@gmail.com' && password === '123456') {
        this.currentUser = { ten: 'Nguyễn Văn A', email: 'test@gmail.com' };
        this.isLoggedIn = true;
        this.contactForm.patchValue({
          lastName: 'Nguyễn',
          firstName: 'Văn A',
          email: this.currentUser.email,
          phone: this.currentUser.phone || this.contactForm.get('phone')?.value || '',
        });
        // 🟩 ADDED: cập nhật validator sau khi đăng nhập
        this.updateContactValidators();
        Swal.fire({
          icon: 'success',
          title: 'Đăng nhập thành công!',
          text: `Xin chào ${this.currentUser.ten}`,
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Sai thông tin đăng nhập!',
          text: 'Email/SĐT hoặc mật khẩu không đúng.',
        });
        event.target.checked = false;
      }
    } else {
      event.target.checked = false;
    }
  }

  async openRegisterPopup(event: any): Promise<void> {
    const registerHTML = `
    <div class="container-fluid px-3" style="max-width: 380px; margin: auto;">
  <h3 class="text-center fw-bold text-primary mb-2" style="color:#132FBA;">
    <i class="bi bi-person-plus-fill me-2"></i>Đăng ký
  </h3>

  <p class="text-center text-muted small mb-3" style="font-size:0.9rem; color:#555;">
    Tạo tài khoản mới để lưu thông tin của bạn
  </p>

  <input id="reg-name" class="form-control mb-2" placeholder="Họ và tên">
  <input id="reg-phone" class="form-control mb-2" placeholder="Số điện thoại">
  <input id="reg-email" class="form-control mb-2" placeholder="Email">

  <div class="position-relative mb-2">
    <input id="reg-password" type="password" class="form-control pe-5" placeholder="Mật khẩu">
    <i id="toggle-pass" class="bi bi-eye-slash position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
       style="cursor:pointer; color:#777;"></i>
  </div>

  <div class="position-relative mb-3">
    <input id="reg-confirm" type="password" class="form-control pe-5" placeholder="Xác nhận mật khẩu">
    <i id="toggle-confirm" class="bi bi-eye-slash position-absolute top-50 end-0 translate-middle-y me-3 text-secondary"
       style="cursor:pointer; color:#777;"></i>
  </div>

  <div class="text-center small mt-2">
    Đã có tài khoản?
    <a href="#" id="login-link" class="fw-semibold text-decoration-none" style="color:#132FBA; font-weight:600;">
      Đăng nhập
    </a>
  </div>
</div>
  `;

    const popup = await Swal.fire({
      html: registerHTML,
      confirmButtonText: '<i class="bi bi-person-check-fill me-1"></i> Đăng ký',
      cancelButtonText: 'Hủy',
      showCancelButton: true,
      background: '#fff',
      width: '380px',
      color: '#333',
      didOpen: () => {
        const passInput = document.getElementById('reg-password') as HTMLInputElement;
        const confirmInput = document.getElementById('reg-confirm') as HTMLInputElement;
        const togglePass = document.getElementById('toggle-pass') as HTMLElement;
        const toggleConfirm = document.getElementById('toggle-confirm') as HTMLElement;
        togglePass.addEventListener('click', () => {
          const hidden = passInput.type === 'password';
          passInput.type = hidden ? 'text' : 'password';
          togglePass.className = hidden ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
        toggleConfirm.addEventListener('click', () => {
          const hidden = confirmInput.type === 'password';
          confirmInput.type = hidden ? 'text' : 'password';
          toggleConfirm.className = hidden ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
        document.getElementById('login-link')?.addEventListener('click', (e) => {
          e.preventDefault();
          Swal.close();
          this.openLoginPopup(event);
        });
      },
      preConfirm: () => {
        const name = (document.getElementById('reg-name') as HTMLInputElement).value.trim();
        const phone = (document.getElementById('reg-phone') as HTMLInputElement).value.trim();
        const email = (document.getElementById('reg-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('reg-password') as HTMLInputElement).value.trim();
        const confirm = (document.getElementById('reg-confirm') as HTMLInputElement).value.trim();
        if (!name || !phone || !email || !password || !confirm) {
          Swal.showValidationMessage('Vui lòng nhập đầy đủ thông tin!');
          return;
        }
        if (password.length < 6) {
          Swal.showValidationMessage('Mật khẩu phải có ít nhất 6 ký tự!');
          return;
        }
        if (password !== confirm) {
          Swal.showValidationMessage('Mật khẩu xác nhận không khớp!');
          return;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          Swal.showValidationMessage('Email không hợp lệ!');
          return;
        }
        if (!/^[0-9]{9,}$/.test(phone)) {
          Swal.showValidationMessage('Số điện thoại không hợp lệ!');
          return;
        }
        return { name, phone, email, password };
      },
    });

    if (popup.value) {
      const { name, phone, email } = popup.value;
      this.currentUser = { ten: name, email, phone };
      this.isLoggedIn = true;
      // 🟩 ADDED: cập nhật validator sau khi đăng ký
      this.updateContactValidators();
      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: `Chào mừng ${name}, bạn đã có thể sử dụng tài khoản.`,
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      event.target.checked = false;
    }
  }

  // 🟩 ADDED: Bật/tắt validator cho 4 trường theo trạng thái đăng nhập + checkbox
  private updateContactValidators(): void {
    // Cần nhập thông tin khi: (chưa đăng nhập) HOẶC (đã đăng nhập nhưng KHÔNG đặt cho chính mình)
    const needContact = !this.isLoggedIn || (this.isLoggedIn && !this.isSelfBooking);

    const lastName  = this.contactForm.get('lastName');
    const firstName = this.contactForm.get('firstName');
    const phone     = this.contactForm.get('phone');
    const email     = this.contactForm.get('email');

    if (needContact) {
      lastName?.setValidators([Validators.required]);
      firstName?.setValidators([Validators.required]);
      phone?.setValidators([Validators.required, Validators.minLength(9)]);
      email?.setValidators([Validators.required, Validators.email]);
    } else {
      lastName?.clearValidators();
      firstName?.clearValidators();
      phone?.clearValidators();
      email?.clearValidators();
    }

    lastName?.updateValueAndValidity({ emitEvent: false });
    firstName?.updateValueAndValidity({ emitEvent: false });
    phone?.updateValueAndValidity({ emitEvent: false });
    email?.updateValueAndValidity({ emitEvent: false });
  }

  // 🟩 ADDED: handler khi đổi trạng thái checkbox trong HTML (nếu bạn bind)
  onSelfBookingToggle(checked: boolean): void {
    this.isSelfBooking = checked;
    this.updateContactValidators();
  }

 confirmBooking(): void {
  // 1️⃣ Kiểm tra đã đồng ý quy định chưa
  if (!this.agreedRules) {
    Swal.fire({
      icon: 'warning',
      title: 'Vui lòng đồng ý với quy định!',
    });
    return;
  }

  // 2️⃣ Nếu chưa đăng nhập → bắt buộc nhập thông tin liên hệ
  if (!this.isLoggedIn) {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Vui lòng điền đầy đủ thông tin liên hệ!',
      });
      return;
    }
  }

  // 3️⃣ Nếu đã đăng nhập → chỉ bắt nhập thông tin nếu KHÔNG tick “Tôi đặt chỗ cho chính mình”
  if (this.isLoggedIn && !this.isSelfBooking) {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Vui lòng nhập thông tin người liên hệ!',
      });
      return;
    }
  }

  // 4️⃣ Nếu qua hết các điều kiện → tạo dữ liệu booking gửi qua trang banking
  const payload = {
    ...this.booking,
    user: this.isLoggedIn
      ? (this.isSelfBooking ? this.currentUser : this.contactForm.value)
      : this.contactForm.value,
    services: (this.booking?.services || []).filter((s: any) => s.active),
    promoCode: this.promoCode,
    total: this.totalPrice,
    date: new Date().toISOString(),
  };

  // ✅ Lưu booking và hiển thị popup “Thanh toán thành công” trước khi chuyển trang
  this.thanhToanService.saveBooking(payload).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Thanh toán thành công!',
        text: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
        confirmButtonText: 'Tiếp tục',
      }).then(() => {
        this.router.navigate(['/banking'], {
          state: {
            booking: this.booking,
            customer: this.isLoggedIn
              ? (this.isSelfBooking ? this.currentUser : this.contactForm.value)
              : this.contactForm.value,
            totalPrice: this.totalPrice,
            qrCodeUrl: 'https://api.vietqr.io/image/970422-TravelokaVN-qr.png',
          },
        });
      });
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Thanh toán thất bại!',
        text: 'Vui lòng thử lại sau.',
      });
    },
  });
}




  togglePriceDetails(): void {
    this.showPriceDetails = !this.showPriceDetails;
  }

  navigateBack(): void {
    window.history.back();
  }

  get bookingSummary(): string {
    const rooms = 1; // mỗi booking = 1 phòng
    let hours = 1;
    const ci = this.booking?.checkInTime;
    const co = this.booking?.checkOutTime;
    if (ci && co) {
      const [ih, im] = String(ci).split(':').map((n: string) => parseInt(n, 10));
      const [oh, om] = String(co).split(':').map((n: string) => parseInt(n, 10));
      const diffMin = (oh * 60 + (om || 0)) - (ih * 60 + (im || 0));
      hours = Math.max(1, Math.ceil(diffMin / 60));
    }
    return `${rooms} phòng, ${hours} giờ`;
  }
}
