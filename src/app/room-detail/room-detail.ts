import { Component } from '@angular/core';
import { Room } from '../interfaces/room';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceDataService } from '../services/service';
import { ReviewService, Review } from '../services/review';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CurrencyPipe, NgIf, NgFor, CommonModule, RouterModule, FormsModule],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.css',
})
export class RoomDetail {
  Math = Math;
  room!: Room;
  currentSlide: number = 0;
  autoSlideInterval: any;
  popupImage: string | null = null;
  isExpanded: boolean = false;
  selectedDate: string = '';
  selectedTime: string = '';
  timeSlots: string[] = [];
  expertServices: any[] = [];
  extraServices: any[] = [];
  totalPrice: number = 0;
  reviews: Review[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  showAllExperts: boolean = false;
  showAllExtras: boolean = false;
  isCartOpen: boolean = false;
  cart: any[] = [];
  cartCount: number = 0;

  constructor(private route: ActivatedRoute, 
              private http: HttpClient,
              private router: Router,
              private serviceData: ServiceDataService,
              private reviewService: ReviewService
            ) {
                this.generateTimeSlots(); // tạo danh sách khung giờ ngay khi khởi tạo
              }

  ngOnInit(): void {
  // 1️⃣ Lấy ID phòng từ URL
  const roomId = Number(this.route.snapshot.paramMap.get('id'));

  // 2️⃣ Gọi dữ liệu phòng
  this.http.get<Room[]>('assets/data/rooms.json').subscribe((rooms) => {
    this.room = rooms.find((r) => r.room_id === roomId)!;
    if (this.room?.photos?.length) this.startAutoSlide();
  });

  // 3️⃣ Gọi dữ liệu dịch vụ (chuyên gia + thuê thêm)
  this.serviceData.getServices().subscribe((data) => {
    this.expertServices = data.expertServices;
    this.extraServices = data.extraServices;
  });

  // 4️⃣ Bắt sự kiện phím tắt (ESC, mũi tên)
  window.addEventListener('keydown', this.handleKeyEvents.bind(this));

  // 5️⃣ Gọi dữ liệu đánh giá từ file JSON
  this.reviewService.getReviews().subscribe((data) => {
    this.reviews = data.filter(r => r.roomId === roomId);
    this.totalReviews = this.reviews.length;
    this.averageRating = this.calculateAverageRating();
  });

  this.loadCart(); // 🔹 load giỏ hàng khi mở trang
}

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => this.nextSlide(), 4000);
  }

  nextSlide(): void {
    if (!this.room?.photos?.length) return;
    this.currentSlide = (this.currentSlide + 1) % this.room.photos.length;
  }

  prevSlide(): void {
    if (!this.room?.photos?.length) return;
    this.currentSlide = (this.currentSlide - 1 + this.room.photos.length) % this.room.photos.length;
  }

  selectSlide(index: number): void {
    this.currentSlide = index;
  }

  openPopup(image: string): void {
    this.popupImage = image;
  }

  closePopup(): void {
    this.popupImage = null;
  }

  toggleDescription(): void {
  this.isExpanded = !this.isExpanded;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Lắng nghe phím tắt
  ngOnDestroy(): void {
    // Xóa listener khi rời trang
    window.removeEventListener('keydown', this.handleKeyEvents.bind(this));
  }

  // Điều hướng ảnh trong popup
  nextPopupImage(event?: Event): void {
    event?.stopPropagation();
    if (!this.room?.photos?.length) return;
    const currentIndex = this.room.photos.indexOf(this.popupImage!);
    const nextIndex = (currentIndex + 1) % this.room.photos.length;
    this.popupImage = this.room.photos[nextIndex];
  }

  prevPopupImage(event?: Event): void {
    event?.stopPropagation();
    if (!this.room?.photos?.length) return;
    const currentIndex = this.room.photos.indexOf(this.popupImage!);
    const prevIndex = (currentIndex - 1 + this.room.photos.length) % this.room.photos.length;
    this.popupImage = this.room.photos[prevIndex];
  }

  // Hỗ trợ phím tắt
  handleKeyEvents(e: KeyboardEvent) {
    if (!this.popupImage) return;
    if (e.key === 'ArrowRight') this.nextPopupImage();
    if (e.key === 'ArrowLeft') this.prevPopupImage();
    if (e.key === 'Escape') this.closePopup();
  }

  // Hàm chọn phòng
selectRoom(): void {
  if (!this.selectedDate || !this.selectedTime) {
    alert('Vui lòng chọn đầy đủ ngày và giờ trước khi đặt phòng!');
    return;
  }

  // Lọc danh sách dịch vụ đã chọn
  const selectedExperts = this.expertServices.filter(e => e.selected);
  const selectedExtras = this.extraServices
    .filter(s => s.selected)
    .map(s => ({ ...s, total: s.price * (s.quantity || 1) }));

  // Gói thông tin đặt phòng
  const bookingInfo = {
    roomId: this.room.room_id,
    roomName: this.room.room_name,
    basePrice: this.room.price,
    totalPrice: this.totalPrice,
    date: this.selectedDate,
    time: this.selectedTime,
    expertServices: selectedExperts,
    extraServices: selectedExtras,
    photo: this.room.photos[0],
  };

  // Lưu vào localStorage để chuyển qua trang thanh toán
  localStorage.setItem('selectedBooking', JSON.stringify(bookingInfo));

  // Điều hướng sang trang thanh toán
  this.router.navigate(['/payment']);
}

  // 🕐 Hàm tạo danh sách khung giờ
generateTimeSlots(): void {
  const startHour = 8;
  const endHour = 22;
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push(`${start} - ${end}`);

    // nghỉ 30p giữa ca (trừ khi là ca cuối)
    if (hour + 1 < endHour) {
      const breakStart = `${(hour + 1).toString().padStart(2, '0')}:30`;
      const breakEnd = `${(hour + 2).toString().padStart(2, '0')}:30`;
      if (hour + 1 < endHour - 1) slots.push(`${breakStart} - ${breakEnd}`);
    }
  }

  this.timeSlots = slots;
}

updateTotal(): void {
  let base = this.room?.price || 0;

  // cộng các dịch vụ chuyên gia đã chọn
  const expertTotal = this.expertServices
    .filter(e => e.selected)
    .reduce((sum, e) => sum + e.price, 0);

  // cộng dịch vụ thuê thêm có số lượng
  const extraTotal = this.extraServices
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);

  this.totalPrice = base + expertTotal + extraTotal;
}

  // 🧮 Tính trung bình sao
  calculateAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / this.reviews.length).toFixed(1));
  }

// 🧠 Toggle giỏ hàng popup
toggleCart(): void {
  this.isCartOpen = !this.isCartOpen;
}

// 🛒 Load giỏ hàng
loadCart(): void {
  this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
  this.cartCount = this.cart.length;
}

// ➕ Add to cart (nâng cấp bản cũ)
addToCart() {
  const expertTotal = this.expertServices
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.price, 0);

  const extraTotal = this.extraServices
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);

  const basePrice = this.room.price;

  const total = basePrice + expertTotal + extraTotal;

  const newItem = {
    roomName: this.room.room_name,
    date: this.selectedDate,
    time: this.selectedTime,
    photo: this.room.photos[0],
    expertServices: this.expertServices.filter(s => s.selected),
    extraServices: this.extraServices.filter(s => s.selected),
    totalPrice: total,
  };

  // 🔹 Load giỏ hàng hiện có trong localStorage (nếu có)
  const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
  currentCart.push(newItem);

  // 🔹 Ghi lại vào localStorage
  localStorage.setItem('cart', JSON.stringify(currentCart));

  // 🔹 Cập nhật biến trong component (để hiện UI)
  this.cart = currentCart;
  this.cartCount = currentCart.length;

  alert('Đã thêm vào giỏ hàng!');
}

// ❌ Xóa item khỏi giỏ
removeFromCart(index: number): void {
  this.cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(this.cart));
  this.loadCart();
}

// 💰 Tính tổng tiền
getCartTotal(): number {
  return this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
}

// 🚀 Điều hướng sang trang thanh toán
goToPayment(): void {
  this.isCartOpen = false;
  this.router.navigate(['/payment']);
  // localStorage.removeItem('cart'); // nếu muốn xóa luôn giỏ sau thanh toán
}

}
