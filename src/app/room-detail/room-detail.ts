import { Component, OnDestroy, OnInit, LOCALE_ID } from '@angular/core';
import { Room } from '../interfaces/room';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceDataService } from '../services/service';
import { ReviewService } from '../services/review';
import { SEOService } from '../services/seo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, FormsModule],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.css',
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }]
})
export class RoomDetail implements OnInit, OnDestroy {
  Math = Math;
  room!: Room;
  currentSlide: number = 0;
  autoSlideInterval: any;
  popupImage: string | null = null;
  isExpanded: boolean = false;
  selectedDate: string = '';
  selectedTime: string = '';
  timeSlots: string[] = [];
  availableTimeSlots: string[] = []; // ✅ FIXED: Chỉ hiển thị các giờ có thể chọn
  minDate: string = ''; // ✅ FIXED: Ngày tối thiểu có thể chọn (hôm nay)
  expertServices: any[] = [];
  extraServices: any[] = [];
  totalPrice: number = 0;
  reviews: any[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  showAllExperts: boolean = false;
  showAllExtras: boolean = false;
  isCartOpen: boolean = false;
  cart: any[] = [];
  // 🟩 UPDATED: cartCount là getter để luôn trả về số items sau khi gộp
  get cartCount(): number {
    return this.getGroupedCartItems().length;
  }
  // 🟩 ADDED: Section hiện tại đang active (để highlight tab)
  activeSection: string = 'overview';
  private scrollHandler?: () => void;

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private router: Router,
    private serviceData: ServiceDataService,
    private reviewService: ReviewService,
    private seoService: SEOService
  ) {
    this.generateTimeSlots(); // tạo danh sách khung giờ ngay khi khởi tạo
    this.setMinDate(); // ✅ FIXED: Set ngày tối thiểu
    this.updateAvailableTimeSlots(); // ✅ FIXED: Cập nhật danh sách giờ có thể chọn
  }

  // ✅ SEO: Hàm slugify để chuyển tên phòng thành URL slug
  slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD') // Chuyển ký tự có dấu thành không dấu
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, '-'); // Loại bỏ nhiều dấu gạch ngang liên tiếp
  }

  ngOnInit(): void {
  // 🟩 ADDED: Scroll to top khi vào trang
  window.scrollTo(0, 0);

  // 1️⃣ Lấy slug phòng từ URL
  const slug = this.route.snapshot.paramMap.get('slug') || '';

  // 2️⃣ Gọi dữ liệu phòng và tìm theo slug
  this.http.get<Room[]>('assets/data/rooms.json').subscribe((rooms) => {
    // Tìm phòng theo slug (slugify từ room_name)
    this.room = rooms.find((r) => this.slugify(r.room_name) === slug)!;
    
    // ✅ SEO: Nếu không tìm thấy phòng, redirect về room-list
    if (!this.room) {
      console.warn(`Không tìm thấy phòng với slug: ${slug}`);
      this.router.navigate(['/room-list']);
      return;
    }
    
    if (this.room?.photos?.length) this.startAutoSlide();
    
    // SEO với structured data
    if (this.room) {
      const roomImage = this.room.photos && this.room.photos.length > 0 
        ? this.room.photos[0] 
        : '/assets/images/BACKGROUND.webp';
      const roomDescription = this.room.description || this.room.long_description || 
        `Đặt phòng ${this.room.room_name} tại Panacea - Không gian trị liệu và chữa lành tâm hồn.`;
      
      this.seoService.updateSEO({
        title: `${this.room.room_name} - Panacea`,
        description: roomDescription,
        keywords: `Panacea, ${this.room.room_name}, đặt phòng, spa, massage, trị liệu, ${this.room.tags?.join(', ') || ''}`,
        image: roomImage,
        type: 'product',
        structuredData: this.seoService.createProductSchema({
          name: this.room.room_name,
          description: roomDescription,
          image: roomImage,
          price: this.room.price || 0,
          currency: 'VND',
          availability: 'https://schema.org/InStock'
        })
      });
    }
    
    // 🟩 ADDED: Scroll to top sau khi load dữ liệu (đảm bảo scroll hoạt động)
    setTimeout(() => window.scrollTo(0, 0), 100);
    
    // ✅ SEO: Redirect đến URL slug nếu URL không khớp với slug hiện tại
    if (this.room && slug !== this.slugify(this.room.room_name)) {
      const correctSlug = this.slugify(this.room.room_name);
      this.router.navigate(['/room-detail', correctSlug], { replaceUrl: true });
    }
    
    // 5️⃣ Gọi dữ liệu đánh giá từ file JSON và localStorage (sau khi room đã được load)
    if (this.room) {
      this.loadReviews(this.room.room_id);
    }
  });

  // 3️⃣ Gọi dữ liệu dịch vụ (chuyên gia + thuê thêm)
  this.serviceData.getServices().subscribe((data) => {
    this.expertServices = data.expertServices;
    this.extraServices = data.extraServices;
  });

  // 4️⃣ Bắt sự kiện phím tắt (ESC, mũi tên)
  window.addEventListener('keydown', this.handleKeyEvents.bind(this));

  this.loadCart(); // 🔹 load giỏ hàng khi mở trang
  
  // 🟩 ADDED: Khởi tạo scroll spy sau khi DOM đã load
  setTimeout(() => {
    this.initScrollSpy();
  }, 500);
}

  // 🟩 ADDED: Khởi tạo scroll spy để tự động highlight tab khi scroll đến section
  initScrollSpy(): void {
    const sections = ['overview', 'policy', 'reviews'];
    const scrollOffset = 120; // Offset để trigger sớm hơn (tính cả navbar height)
    
    // Hàm update activeSection dựa trên vị trí scroll
    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + scrollOffset;
      let currentSection = 'overview';
      let activeElement: HTMLElement | null = null;
      let activeDistance = Infinity;
      
      // Tìm section nào có top position gần nhất với scroll position
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = window.scrollY + rect.top;
          const distance = Math.abs(scrollPosition - elementTop);
          
          // Nếu section đã vượt qua top của viewport (đang scroll trong section này)
          // hoặc section gần với scroll position nhất
          if (elementTop <= scrollPosition + 100) {
            if (distance < activeDistance) {
              activeDistance = distance;
              activeElement = element;
              currentSection = sectionId;
            }
          }
        }
      });
      
      // Fallback: Nếu ở đầu trang, luôn chọn 'overview'
      if (window.scrollY < 50) {
        currentSection = 'overview';
      }
      // Nếu không tìm thấy section nào phù hợp và đang ở giữa trang
      // Chọn section cuối cùng đã vượt qua
      else if (!activeElement && window.scrollY > 100) {
        for (let i = sections.length - 1; i >= 0; i--) {
          const element = document.getElementById(sections[i]);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = window.scrollY + rect.top;
            if (elementTop <= scrollPosition) {
              currentSection = sections[i];
              break;
            }
          }
        }
      }
      
      // Update activeSection nếu khác với giá trị hiện tại
      if (this.activeSection !== currentSection) {
        this.activeSection = currentSection;
      }
    };
    
    // Listen scroll event với throttle để tối ưu performance
    let ticking = false;
    this.scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    
    // Gọi lần đầu để set activeSection ban đầu
    setTimeout(() => updateActiveSection(), 300);
  }

  // 🟩 ADDED: Hàm quay lại trang room-list
  navigateBack(): void {
    this.router.navigate(['/room-list']);
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
      // 🟩 UPDATED: Update activeSection ngay lập tức khi click tab
      this.activeSection = sectionId;
      // Scroll với offset để tránh bị che bởi sticky navbar
      const offset = 80; // Khoảng cách từ top (chiều cao của navbar)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Lắng nghe phím tắt
  ngOnDestroy(): void {
    // Xóa listener khi rời trang
    window.removeEventListener('keydown', this.handleKeyEvents.bind(this));
    // 🟩 ADDED: Remove scroll event listener khi destroy component
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
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

  // Hàm chọn phòng (Thanh toán ngay)
selectRoom(): void {
  if (!this.selectedDate || !this.selectedTime) {
    Swal.fire({
      icon: 'warning',
      title: 'Thiếu thông tin',
      text: 'Vui lòng chọn đầy đủ ngày và giờ trước khi đặt phòng!',
      confirmButtonColor: '#132fba'
    });
    return;
  }

  // ✅ FIXED: Kiểm tra ngày không được trong quá khứ
  if (this.isPastDate(this.selectedDate)) {
    Swal.fire({
      icon: 'error',
      title: 'Ngày không hợp lệ',
      text: 'Không thể chọn ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi.',
      confirmButtonColor: '#132fba'
    });
    return;
  }

  // ✅ FIXED: Kiểm tra giờ không được trong quá khứ
  if (this.isPastTime(this.selectedDate, this.selectedTime)) {
    Swal.fire({
      icon: 'error',
      title: 'Giờ không hợp lệ',
      text: 'Không thể chọn giờ trong quá khứ. Vui lòng chọn giờ trong tương lai.',
      confirmButtonColor: '#132fba'
    });
    return;
  }

  // 🟩 UPDATED: Không chọn dịch vụ ở room-detail, dịch vụ sẽ được chọn ở trang payment
  // 🟩 UPDATED: Gói thông tin đặt phòng với đầy đủ dữ liệu từ room-detail
  const bookingInfo = {
    roomId: this.room.room_id,
    roomName: this.room.room_name,
    basePrice: this.room.price,
    totalPrice: this.room.price, // Chỉ tính giá phòng cơ bản
    date: this.selectedDate,
    time: this.selectedTime,
    expertServices: [], // Dịch vụ sẽ được chọn ở payment
    extraServices: [], // Dịch vụ sẽ được chọn ở payment
    photo: this.room.photos[0],
    range: this.room.range, // 🟩 ADDED: Thêm range (số lượng người)
    // 🟩 ADDED: Thêm timestamp để đảm bảo đọc đúng dữ liệu mới nhất
    timestamp: Date.now(),
  };

  // 🟩 UPDATED: Xóa các dữ liệu cũ để đảm bảo đọc đúng dữ liệu mới từ "Thanh toán ngay"
  // Khi bấm "Thanh toán ngay", chỉ lấy dữ liệu từ room-detail, không liên quan đến cart
  localStorage.removeItem('paymentState');
  localStorage.removeItem('processedBookings'); // 🟩 UPDATED: Xóa processedBookings để tránh xung đột với cart
  localStorage.removeItem('selectedBooking'); // Xóa selectedBooking cũ (nếu có từ lần trước)
  
  // 🟩 UPDATED: Lưu vào localStorage để chuyển qua trang thanh toán
  localStorage.setItem('selectedBooking', JSON.stringify(bookingInfo));
  

  // Điều hướng sang trang thanh toán
  this.router.navigate(['/payment']);
}

  // ✅ FIXED: Set ngày tối thiểu (hôm nay)
  setMinDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  // ✅ FIXED: Kiểm tra xem ngày có phải trong quá khứ không
  isPastDate(dateStr: string): boolean {
    if (!dateStr) return false;
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }

  // ✅ FIXED: Kiểm tra xem giờ có phải trong quá khứ không
  isPastTime(dateStr: string, timeStr: string): boolean {
    if (!dateStr || !timeStr) return false;
    
    try {
      // Parse time slot (ví dụ: "09:00 - 10:00")
      const [startTime] = timeStr.split(' - ');
      const [hours, minutes] = startTime.split(':').map(Number);
      
      // Parse date
      const selectedDate = new Date(dateStr);
      selectedDate.setHours(hours, minutes, 0, 0);
      
      // So sánh với thời điểm hiện tại
      // ✅ FIXED: Đảm bảo không cho chọn giờ hiện tại hoặc quá khứ
      const now = new Date();
      now.setSeconds(0, 0); // Reset giây và milliseconds để so sánh chính xác
      
      // Nếu chọn hôm nay và giờ đã qua hoặc bằng giờ hiện tại → không hợp lệ
      return selectedDate <= now;
    } catch (e) {
      return false;
    }
  }

  // ✅ FIXED: Cập nhật danh sách giờ có thể chọn dựa trên ngày đã chọn
  updateAvailableTimeSlots(): void {
    if (!this.selectedDate) {
      // Nếu chưa chọn ngày, hiển thị tất cả giờ
      this.availableTimeSlots = [...this.timeSlots];
      return;
    }

    const today = new Date();
    const selectedDate = new Date(this.selectedDate);
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (isToday) {
      // Nếu chọn hôm nay, chỉ hiển thị các giờ trong tương lai
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // ✅ FIXED: Luôn cho đặt từ giờ tiếp theo (ví dụ: bây giờ 16:30 thì chỉ cho đặt từ 17:00)
      // Logic: Vì các slot là giờ chẵn (8:00, 9:00, 10:00...), nên:
      // - Nếu bây giờ là 16:00 → có thể cho chọn từ 17:00 (giờ tiếp theo)
      // - Nếu bây giờ là 16:01-16:59 → chỉ cho chọn từ 17:00 (giờ tiếp theo)
      // - Nếu bây giờ là 17:00 → chỉ cho chọn từ 18:00 (giờ tiếp theo)
      const minHour = currentHour + 1;
      
      // Nếu đã qua 22:00, không còn giờ nào có thể chọn
      if (minHour >= 22) {
        this.availableTimeSlots = [];
        return;
      }
      
      this.availableTimeSlots = this.timeSlots.filter(slot => {
        const [startTime] = slot.split(' - ');
        const [hours] = startTime.split(':').map(Number);
        return hours >= minHour;
      });
    } else {
      // Nếu chọn ngày trong tương lai, hiển thị tất cả giờ
      this.availableTimeSlots = [...this.timeSlots];
    }
  }

  // ✅ FIXED: Format ngày từ YYYY-MM-DD sang dd/mm/yyyy
  formatDateToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // ✅ FIXED: Xử lý khi ngày thay đổi
  onDateChange(): void {
    // Reset giờ khi đổi ngày
    this.selectedTime = '';
    this.updateAvailableTimeSlots();
  }

  // ✅ FIXED: Xử lý khi giờ thay đổi
  onTimeChange(): void {
    // Có thể thêm validation ở đây nếu cần
  }

  // 🕐 Hàm tạo danh sách khung giờ (chỉ giờ chẵn, không có giờ lẻ 30 phút)
generateTimeSlots(): void {
  const startHour = 8;
  const endHour = 22;
  const slots: string[] = [];

  // Chỉ tạo các khung giờ chẵn (00 phút), bỏ hết các giờ lẻ (30 phút)
  for (let hour = startHour; hour < endHour; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
    slots.push(`${start} - ${end}`);
  }

  this.timeSlots = slots;
  this.availableTimeSlots = [...slots]; // Khởi tạo với tất cả giờ
}

updateTotal(): void {
  // 🟩 UPDATED: Chỉ tính giá phòng cơ bản, dịch vụ sẽ được chọn ở trang payment
  this.totalPrice = this.room?.price || 0;
}

  // 🧮 Load reviews từ reviews.json và localStorage
  loadReviews(roomId: number): void {
    // Load từ reviews.json trước
    this.reviewService.getReviews().subscribe((data: any[]) => {
      let allReviews = [...data];
      
      // Merge với reviews từ localStorage (nếu có)
      try {
        const localReviews = localStorage.getItem('REVIEWS');
        if (localReviews) {
          // ✅ FIXED: Thêm try-catch cho JSON.parse
          let parsedReviews: any[] = [];
          try {
            parsedReviews = JSON.parse(localReviews);
          } catch (parseError) {
            console.error('Error parsing reviews from localStorage:', parseError);
            parsedReviews = [];
          }
          // Gộp tất cả reviews, loại bỏ trùng lặp dựa trên id
          const reviewMap = new Map();
          
          // Thêm reviews từ JSON trước
          data.forEach((r: any) => {
            if (r.id) reviewMap.set(r.id, r);
          });
          
          // Thêm/update reviews từ localStorage (ưu tiên hơn)
          parsedReviews.forEach((r: any) => {
            if (r.id) reviewMap.set(r.id, r);
          });
          
          allReviews = Array.from(reviewMap.values());
        }
      } catch (e) {
        console.warn('Could not load reviews from localStorage:', e);
      }
      
      // Filter theo roomId và hiển thị tất cả
      this.reviews = allReviews.filter((r: any) => r.roomId === roomId);
      this.totalReviews = this.reviews.length;
      this.averageRating = this.calculateAverageRating();
    });
  }

  // 🧮 Tính trung bình sao (làm tròn 1 chữ số)
  calculateAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return parseFloat((sum / this.reviews.length).toFixed(1));
  }

  // 🧮 Tính số sao hiển thị (4 hoặc 5)
  getDisplayStars(): number {
    if (this.averageRating < 4.5) {
      return 4;
    }
    return 5;
  }

// 🧠 Toggle giỏ hàng popup
toggleCart(): void {
  this.isCartOpen = !this.isCartOpen;
}

// 🛒 Load giỏ hàng
loadCart(): void {
  // ✅ FIXED: Thêm try-catch cho JSON.parse
  try {
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    this.cart = [];
  }
  // cartCount là getter, không cần cập nhật thủ công
}

// ➕ Add to cart (nâng cấp bản cũ)
addToCart() {
  if (!this.selectedDate || !this.selectedTime) {
    Swal.fire({
      icon: 'warning',
      title: 'Vui lòng chọn đầy đủ thông tin!',
      text: 'Bạn cần chọn ngày và giờ trước khi thêm vào giỏ hàng.',
      confirmButtonText: 'Đã hiểu',
      confirmButtonColor: '#132fba'
    });
    return;
  }

  // ✅ FIXED: Kiểm tra ngày không được trong quá khứ
  if (this.isPastDate(this.selectedDate)) {
    Swal.fire({
      icon: 'error',
      title: 'Ngày không hợp lệ',
      text: 'Không thể chọn ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi.',
      confirmButtonColor: '#132fba'
    });
    return;
  }

  // ✅ FIXED: Kiểm tra giờ không được trong quá khứ
  if (this.isPastTime(this.selectedDate, this.selectedTime)) {
    Swal.fire({
      icon: 'error',
      title: 'Giờ không hợp lệ',
      text: 'Không thể chọn giờ trong quá khứ. Vui lòng chọn giờ trong tương lai.',
      confirmButtonColor: '#132fba'
    });
    return;
  }

  // 🟩 UPDATED: Không chọn dịch vụ ở room-detail, dịch vụ sẽ được chọn ở trang payment
  const basePrice = this.room.price;

  const newItem = {
    roomId: this.room.room_id, // 🟩 ADDED: Thêm roomId để so sánh
    roomName: this.room.room_name,
    date: this.selectedDate,
    time: this.selectedTime,
    photo: this.room.photos[0],
    basePrice: basePrice, // 🟩 ADDED: Thêm basePrice
    expertServices: [], // Dịch vụ sẽ được chọn ở payment
    extraServices: [], // Dịch vụ sẽ được chọn ở payment
    totalPrice: basePrice, // Chỉ tính giá phòng cơ bản
  };

  // 🔹 Load giỏ hàng hiện có trong localStorage (nếu có)
  // ✅ FIXED: Thêm try-catch cho JSON.parse
  let currentCart: any[] = [];
  try {
    currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    currentCart = [];
  }
  
  currentCart.push(newItem);

  // 🔹 Ghi lại vào localStorage
  localStorage.setItem('cart', JSON.stringify(currentCart));

  // 🔹 Cập nhật biến trong component (để hiện UI)
  this.cart = currentCart;
  // cartCount là getter, không cần cập nhật thủ công

  // 🟩 ADDED: Dispatch event để cart-widget cập nhật ngay
  window.dispatchEvent(new CustomEvent('cartUpdated'));

  // 🟩 UPDATED: Hiển thị popup SweetAlert khi thêm vào giỏ hàng thành công
  Swal.fire({
    icon: 'success',
    title: 'Thêm vào giỏ hàng thành công!',
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

// ❌ Xóa item khỏi giỏ
removeFromCart(index: number): void {
  this.cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(this.cart));
  this.loadCart();
  // 🟩 ADDED: Dispatch event để cart-widget cập nhật ngay
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

// 🟩 ADDED: Xóa nhóm items khỏi giỏ (xóa tất cả items trong nhóm)
removeGroupFromCart(group: any): void {
  const itemsToRemove = (group.originalItems || [group]).map((item: any) => 
    `${item.roomId}_${item.date}_${item.time}`
  );
  const remainingCart = this.cart.filter((c: any) => {
    const key = `${c.roomId}_${c.date}_${c.time}`;
    return !itemsToRemove.includes(key);
  });
  
  localStorage.setItem('cart', JSON.stringify(remainingCart));
  this.cart = remainingCart;
  // cartCount là getter, không cần cập nhật thủ công
}

// 💰 Tính tổng tiền
getCartTotal(): number {
  return this.cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
}

// 🟩 ADDED: Nhóm các items trong giỏ hàng và gộp giờ liên tiếp
getGroupedCartItems(): any[] {
  if (this.cart.length === 0) return [];
  
  // Gộp các items cùng phòng và giờ liên tiếp
  const merged = this.mergeConsecutiveBookings([...this.cart]);
  
  // Chuyển đổi thành format để hiển thị trong giỏ hàng
  return merged.map(item => {
    // Tính số giờ
    const [start, end] = item.time.split(' - ').map((t: string) => t.trim());
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    const hours = Math.max(1, Math.ceil((toMinutes(end) - toMinutes(start)) / 60));
    
    return {
      roomId: item.roomId,
      roomName: item.roomName,
      date: item.date,
      time: item.time,
      hours: hours,
      photo: item.photo,
      basePrice: item.basePrice,
      expertServices: item.expertServices || [],
      extraServices: item.extraServices || [],
      totalPrice: item.totalPrice,
      // 🟩 UPDATED: Sử dụng originalItems đã được lưu trong mergeConsecutiveBookings
      originalItems: item.originalItems || []
    };
  });
}

// 🟩 ADDED: Kiểm tra xem time có nằm trong range không
private isTimeInRange(time: string, range: string): boolean {
  const [timeStart, timeEnd] = time.split(' - ').map((t: string) => t.trim());
  const [rangeStart, rangeEnd] = range.split(' - ').map((t: string) => t.trim());
  
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  const timeStartMin = toMinutes(timeStart);
  const timeEndMin = toMinutes(timeEnd);
  const rangeStartMin = toMinutes(rangeStart);
  const rangeEndMin = toMinutes(rangeEnd);
  
  // Kiểm tra xem time có nằm trong range không
  return timeStartMin >= rangeStartMin && timeEndMin <= rangeEndMin;
}

// 🟩 ADDED: Lấy index của item trong cart (dựa trên roomId, date, time)
getCartItemIndex(item: any): number {
  return this.cart.findIndex((c: any) => 
    c.roomId === item.roomId &&
    c.date === item.date &&
    c.time === item.time
  );
}

// 🟩 ADDED: Thanh toán cho một nhóm items (đã được gộp giờ liên tiếp)
goToPaymentForGroup(group: any): void {
  this.isCartOpen = false;
  
  // Lấy tất cả items gốc thuộc nhóm này
  const groupItems = group.originalItems || [group];
  
  if (groupItems.length === 0) {
    alert('Không tìm thấy items để thanh toán!');
    return;
  }
  
  // 🟩 UPDATED: Xóa paymentState và selectedBooking cũ khi thanh toán từ cart
  // Đảm bảo chỉ lấy dữ liệu từ cart, không bị xung đột với "Thanh toán ngay"
  localStorage.removeItem('paymentState');
  localStorage.removeItem('selectedBooking'); // 🟩 ADDED: Xóa selectedBooking để tránh xung đột
  
  // Gộp các items cùng phòng và giờ liên tiếp (nếu chưa được gộp)
  const processedBookings = this.mergeConsecutiveBookings(groupItems);
  
  // 🟩 UPDATED: Lưu vào localStorage để payment đọc (từ cart)
  localStorage.setItem('processedBookings', JSON.stringify(processedBookings));
  
  
  // Xóa items đã thanh toán khỏi giỏ hàng
  const itemsToRemove = groupItems.map((item: any) => 
    `${item.roomId}_${item.date}_${item.time}`
  );
  const remainingCart = this.cart.filter((c: any) => {
    const key = `${c.roomId}_${c.date}_${c.time}`;
    return !itemsToRemove.includes(key);
  });
  
  localStorage.setItem('cart', JSON.stringify(remainingCart));
  this.cart = remainingCart;
  // cartCount là getter, không cần cập nhật thủ công
  
  // Điều hướng sang trang thanh toán
  this.router.navigate(['/payment']);
}

// 🟩 ADDED: Hàm kiểm tra 2 khoảng thời gian có liên tiếp không
private areTimesConsecutive(time1: string, time2: string): boolean {
  // time format: "HH:mm - HH:mm"
  const [start1, end1] = time1.split(' - ').map((t: string) => t.trim());
  const [start2, end2] = time2.split(' - ').map((t: string) => t.trim());
  
  // Chuyển thành phút để so sánh
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const end1Minutes = toMinutes(end1);
  const start2Minutes = toMinutes(start2);
  
  // Liên tiếp nếu end1 = start2
  return end1Minutes === start2Minutes;
}

// 🟩 ADDED: Hàm kiểm tra 2 khoảng thời gian có trùng lặp không
private areTimesOverlapping(time1: string, time2: string): boolean {
  const [start1, end1] = time1.split(' - ').map((t: string) => t.trim());
  const [start2, end2] = time2.split(' - ').map((t: string) => t.trim());
  
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  const start1Min = toMinutes(start1);
  const end1Min = toMinutes(end1);
  const start2Min = toMinutes(start2);
  const end2Min = toMinutes(end2);
  
  // Trùng lặp nếu có overlap
  return !(end1Min <= start2Min || end2Min <= start1Min);
}

// 🟩 ADDED: Hàm gộp các bookings cùng phòng và giờ liên tiếp/overlap
private mergeConsecutiveBookings(cart: any[]): any[] {
  if (cart.length === 0) return [];
  
  // Nhóm theo roomId và date
  const grouped: { [key: string]: any[] } = {};
  cart.forEach(item => {
    const key = `${item.roomId}_${item.date}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
  
  const merged: any[] = [];
  
  // Helper function để chuyển time string thành minutes
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  
  // Helper function để chuyển minutes thành time string
  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  // Xử lý từng nhóm (cùng phòng, cùng ngày)
  Object.values(grouped).forEach(group => {
    // Sắp xếp theo thời gian bắt đầu
    group.sort((a, b) => {
      const [startA] = a.time.split(' - ').map((t: string) => t.trim());
      const [startB] = b.time.split(' - ').map((t: string) => t.trim());
      return startA.localeCompare(startB);
    });
    
    // Tạo intervals từ các items
    const intervals: Array<{ start: number, end: number, item: any }> = group.map(item => {
      const [start, end] = item.time.split(' - ').map((t: string) => t.trim());
      return {
        start: toMinutes(start),
        end: toMinutes(end),
        item: item
      };
    });
    
    // Merge intervals (gộp các khoảng overlap hoặc liên tiếp)
    const mergedIntervals: Array<{ start: number, end: number, items: any[] }> = [];
    
    intervals.forEach(interval => {
      if (mergedIntervals.length === 0) {
        mergedIntervals.push({
          start: interval.start,
          end: interval.end,
          items: [interval.item]
        });
      } else {
        const last = mergedIntervals[mergedIntervals.length - 1];
        // Gộp nếu overlap hoặc liên tiếp (end của last >= start của interval)
        if (last.end >= interval.start) {
          // Gộp: cập nhật end thành max của cả hai
          last.end = Math.max(last.end, interval.end);
          last.items.push(interval.item);
        } else {
          // Không gộp được → tạo interval mới
          mergedIntervals.push({
            start: interval.start,
            end: interval.end,
            items: [interval.item]
          });
        }
      }
    });
    
    // Tạo booking items từ các merged intervals
    mergedIntervals.forEach(mergedInterval => {
      const items = mergedInterval.items;
      if (items.length === 0) return;
      
      // Lấy item đầu tiên làm base
      const baseItem = items[0];
      const mergedBooking: any = {
        ...baseItem,
        time: `${toTimeString(mergedInterval.start)} - ${toTimeString(mergedInterval.end)}`,
        basePrice: 0,
        totalPrice: 0,
        expertServices: [],
        extraServices: [],
        // 🟩 ADDED: Lưu danh sách items gốc để xóa khi thanh toán
        originalItems: items
      };
      
      // Gộp tất cả items trong interval
      const expertServicesMap = new Map();
      const extraServicesMap = new Map();
      
      items.forEach((item: any) => {
        // Cộng basePrice
        mergedBooking.basePrice += item.basePrice || 0;
        mergedBooking.totalPrice += item.basePrice || 0;
        
        // Gộp expert services (không cộng dồn nếu trùng)
        (item.expertServices || []).forEach((ex: any) => {
          if (!expertServicesMap.has(ex.id)) {
            expertServicesMap.set(ex.id, { ...ex });
            mergedBooking.totalPrice += ex.price || 0;
          }
        });
        
        // Gộp extra services (cộng dồn quantity nếu trùng)
        (item.extraServices || []).forEach((ex: any) => {
          const key = ex.id;
          if (extraServicesMap.has(key)) {
            const existing = extraServicesMap.get(key);
            existing.quantity = (existing.quantity || 1) + (ex.quantity || 1);
            mergedBooking.totalPrice += (ex.price || 0) * (ex.quantity || 1);
          } else {
            extraServicesMap.set(key, { ...ex, quantity: ex.quantity || 1 });
            mergedBooking.totalPrice += (ex.price || 0) * (ex.quantity || 1);
          }
        });
      });
      
      // Chuyển Map thành array
      mergedBooking.expertServices = Array.from(expertServicesMap.values());
      mergedBooking.extraServices = Array.from(extraServicesMap.values());
      
      merged.push(mergedBooking);
    });
  });
  
  return merged;
}

// 🚀 Điều hướng sang trang thanh toán (thanh toán tất cả items)
goToPayment(): void {
  this.isCartOpen = false;
  
  // 🟩 UPDATED: Xử lý cart và gộp/tách bookings
  // ✅ FIXED: Thêm try-catch cho JSON.parse
  let cart: any[] = [];
  try {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    cart = [];
  }
  
  if (cart.length === 0) {
    alert('Giỏ hàng trống!');
    return;
  }
  
  // 🟩 UPDATED: Xóa paymentState và selectedBooking cũ khi thanh toán từ cart
  // Đảm bảo chỉ lấy dữ liệu từ cart, không bị xung đột với "Thanh toán ngay"
  localStorage.removeItem('paymentState');
  localStorage.removeItem('selectedBooking'); // 🟩 ADDED: Xóa selectedBooking để tránh xung đột
  
  // Gộp các bookings cùng phòng và giờ liên tiếp
  const processedBookings = this.mergeConsecutiveBookings(cart);
  
  // 🟩 UPDATED: Lưu vào localStorage để payment đọc (từ cart)
  localStorage.setItem('processedBookings', JSON.stringify(processedBookings));
  
  
  // Điều hướng sang trang thanh toán
  this.router.navigate(['/payment']);
}

// 🟩 ADDED: Thanh toán từng item riêng (từ giỏ hàng)
goToPaymentForItem(index: number): void {
  this.isCartOpen = false;
  
  // ✅ FIXED: Thêm try-catch cho JSON.parse
  let cart: any[] = [];
  try {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    cart = [];
  }
  
  if (index < 0 || index >= cart.length) {
    alert('Item không hợp lệ!');
    return;
  }
  
  // Lấy item tại index
  const item = cart[index];
  
  // Tạo mảng chỉ chứa item này (để gộp giờ liên tiếp nếu có)
  // Tìm tất cả items cùng phòng, cùng ngày, và giờ liên tiếp với item này
  const sameRoomItems = cart.filter((c: any) => 
    c.roomId === item.roomId && c.date === item.date
  );
  
  // 🟩 UPDATED: Xóa paymentState và selectedBooking cũ khi thanh toán từ cart
  // Đảm bảo chỉ lấy dữ liệu từ cart, không bị xung đột với "Thanh toán ngay"
  localStorage.removeItem('paymentState');
  localStorage.removeItem('selectedBooking'); // 🟩 ADDED: Xóa selectedBooking để tránh xung đột
  
  // Gộp các items cùng phòng và giờ liên tiếp
  const processedBookings = this.mergeConsecutiveBookings(sameRoomItems);
  
  // 🟩 UPDATED: Lưu vào localStorage để payment đọc (từ cart)
  localStorage.setItem('processedBookings', JSON.stringify(processedBookings));
  
  
  // Xóa items đã thanh toán khỏi giỏ hàng
  const remainingCart = cart.filter((c: any, i: number) => {
    // Xóa item tại index và các items cùng phòng, cùng ngày (đã được gộp)
    if (i === index) return false;
    if (c.roomId === item.roomId && c.date === item.date) {
      // Kiểm tra xem item này có trong processedBookings không (đã được gộp)
      return !processedBookings.some((pb: any) => {
        const [pbStart, pbEnd] = pb.time.split(' - ');
        const [cStart, cEnd] = c.time.split(' - ');
        // Nếu thời gian của c nằm trong khoảng thời gian của pb thì đã được gộp
        return cStart >= pbStart && cEnd <= pbEnd;
      });
    }
    return true;
  });
  
  localStorage.setItem('cart', JSON.stringify(remainingCart));
  this.cart = remainingCart;
  // cartCount là getter, không cần cập nhật thủ công
  
  // Điều hướng sang trang thanh toán
  this.router.navigate(['/payment']);
}

}
