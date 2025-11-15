import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import vouchersData from '../../assets/data/voucher.json';
import itemsData from '../../assets/data/items.json';
import { Voucher } from '../interfaces/voucher';
import { Items } from '../interfaces/items';
import { InvoiceService } from '../services/invoice';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { SEOService } from '../services/seo.service';

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exchange.html',
  styleUrls: ['./exchange.css']
})
export class Exchange implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private invoiceService: InvoiceService,
    private userService: UserService,
    private authService: AuthService,
    private seoService: SEOService
  ) {}

  // ===== DỮ LIỆU NGƯỜI DÙNG =====
  userPoints: number = 0;
  currentUser: any = null;
  isLoggedIn: boolean = false;

  // ===== DỮ LIỆU VOUCHER & ITEM =====
  vouchers: Voucher[] = (vouchersData as any[]).map(v => ({ ...v, status: v.status || 'Còn hiệu lực' }));
  items: Items[] = itemsData as Items[];
  
  // ===== BỘ LỌC & TÌM KIẾM =====
  searchQuery: string = '';
  selectedCategory: string = 'all'; // 'all', 'voucher', 'item'
  pointsSort: string = 'none'; // 'none', 'low', 'high'
  nameSort: string = 'none'; // 'none', 'asc', 'desc'
  pointsFilter: string = 'all'; // 'all', '0-200', '200-400', '400-600', '600+'
  filteredVouchers: Voucher[] = [];
  filteredItems: Items[] = [];

  // ===== DANH SÁCH TỈNH & HUYỆN =====
  provinces = [
    { name: 'TP. Hồ Chí Minh', districts: ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'TP. Thủ Đức'] },
    { name: 'Hà Nội', districts: ['Hoàn Kiếm', 'Cầu Giấy', 'Hà Đông', 'Nam Từ Liêm'] },
    { name: 'Đà Nẵng', districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'] },
    { name: 'Cần Thơ', districts: ['Ninh Kiều', 'Bình Thủy', 'Cái Răng'] },
    { name: 'Bình Dương', districts: ['Thủ Dầu Một', 'Dĩ An', 'Thuận An'] }
  ];

  ngOnInit(): void {
    // SEO
    this.seoService.updateSEO({
      title: 'Đổi Xu Panacea - Voucher & Ưu Đãi',
      description: 'Đổi Xu Panacea lấy voucher, ưu đãi và các phần quà hấp dẫn. Tích điểm và sử dụng Xu để nhận nhiều ưu đãi đặc biệt.',
      keywords: 'Đổi Xu Panacea, voucher Panacea, ưu đãi Panacea, tích điểm Panacea',
      image: '/assets/images/BACKGROUND.webp'
    });
    
    this.loadUserData();
    this.checkVoucherStatus();
    // Khởi tạo filtered arrays
    this.filteredVouchers = [...this.vouchers];
    this.filteredItems = [...this.items];
    this.applyFilters();
    
    // Subscribe để reload dữ liệu khi đăng nhập/đăng xuất
    this.authService.getCurrentAccount()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (account) => {
          if (account) {
            // Reload user data từ users.json khi có thay đổi
            this.loadUserData();
          } else {
            this.userPoints = 0;
            this.isLoggedIn = false;
            this.currentUser = null;
          }
        },
        error: () => {
          this.userPoints = 0;
          this.isLoggedIn = false;
          this.currentUser = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** 👤 Load dữ liệu user và điểm từ users.json */
  loadUserData(): void {
    // Lấy dữ liệu từ users.json qua localStorage
    const usersStr = localStorage.getItem('USERS');
    const uid = localStorage.getItem('UID');
    
    if (usersStr && uid) {
      try {
        const users = JSON.parse(usersStr);
        const user = users.find((u: any) => u.user_id === uid);
        
        if (user) {
          this.currentUser = user;
          this.isLoggedIn = true;
          // Lấy coin từ users.json
          this.userPoints = user.coin || 0;
        } else {
          this.userPoints = 0;
          this.isLoggedIn = false;
        }
      } catch (e) {
        // Nếu parse lỗi, thử lấy từ CURRENT_USER
        this.loadFromCurrentUser();
      }
    } else {
      // Nếu không có USERS hoặc UID, thử lấy từ CURRENT_USER
      this.loadFromCurrentUser();
    }
  }

  private loadFromCurrentUser(): void {
    const currentUserStr = localStorage.getItem('CURRENT_USER');
    if (currentUserStr) {
      try {
        const user = JSON.parse(currentUserStr);
        this.currentUser = user;
        this.isLoggedIn = true;
        // Lấy coin từ users.json
        this.userPoints = user.coin || 0;
      } catch (e) {
        this.userPoints = 0;
        this.isLoggedIn = false;
      }
    } else {
      this.userPoints = 0;
      this.isLoggedIn = false;
    }
  }

  /** Cập nhật coin trong users.json */
  private updateUserCoin(newCoin: number): void {
    const usersStr = localStorage.getItem('USERS');
    const uid = localStorage.getItem('UID');
    
    if (usersStr && uid) {
      try {
        const users = JSON.parse(usersStr);
        const userIndex = users.findIndex((u: any) => u.user_id === uid);
        
        if (userIndex !== -1) {
          // Cập nhật coin trong users list
          users[userIndex].coin = newCoin;
          localStorage.setItem('USERS', JSON.stringify(users));
          
          // Cập nhật CURRENT_USER
          if (this.currentUser) {
            this.currentUser.coin = newCoin;
            localStorage.setItem('CURRENT_USER', JSON.stringify(this.currentUser));
          }
        }
      } catch (e) {
        console.error('Error updating user coin:', e);
      }
    }
  }

  /** ✅ Kiểm tra trạng thái voucher */
  checkVoucherStatus(): void {
    const today = new Date().toISOString().split('T')[0];
    this.vouchers.forEach(v => {
      if (v.startDate && v.endDate) {
        v.status = v.startDate <= today && today <= v.endDate ? 'Còn hiệu lực' : 'Hết hạn';
      } else {
        v.status = 'Còn hiệu lực';
      }
    });
  }

  /** 🎫 ĐỔI VOUCHER */
  async redeemVoucher(v: Voucher): Promise<void> {
    if (v.status === 'Hết hạn') {
      await Swal.fire({
        icon: 'warning',
        title: 'Voucher đã hết hạn',
        text: 'Vui lòng chọn voucher khác.',
        confirmButtonColor: '#132fba'
      });
      return;
    }

    if (this.userPoints < v.pointsRequired) {
      await Swal.fire({
        icon: 'error',
        title: 'Không đủ điểm!',
        text: `Bạn cần thêm ${v.pointsRequired - this.userPoints} điểm để đổi voucher này.`,
        confirmButtonColor: '#132fba'
      });
      return;
    }

    const confirmRes = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận đổi voucher?',
      html: `
        <p>Voucher: <b>${v.type}</b></p>
        <p>Điểm cần đổi: <b>${v.pointsRequired.toLocaleString()}</b></p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
      confirmButtonColor: '#132fba',
      cancelButtonColor: '#6c757d'
    });

    if (!confirmRes.isConfirmed) return;

    this.userPoints -= v.pointsRequired;
    
    // Cập nhật coin vào users.json nếu đã đăng nhập
    if (this.isLoggedIn && this.currentUser) {
      this.updateUserCoin(this.userPoints);
    }
    
    // ✅ FIXED: Chỉ hiển thị code gốc từ voucher.json, không thêm số random
    const code = v.code;

    await Swal.fire({
      icon: 'success',
      title: 'Đổi voucher thành công!',
      html: `
        <p>Bạn đã đổi voucher <b>${v.type}</b>.</p>
        <div style="margin-top:16px;margin-bottom:8px;font-weight:500;color:#333;">Mã voucher của bạn:</div>
        <div style="
          margin-top:8px;display:inline-flex;align-items:center;gap:10px;
          background:linear-gradient(135deg, #132fba 0%, #4b6fff 100%);color:#fff;
          padding:12px 20px;border-radius:12px;box-shadow:0 4px 12px rgba(19,47,186,0.3);">
          <span style="font-weight:700;letter-spacing:1px;font-size:16px;">${code}</span>
          <button id="copyCodeBtn" style="
            border:none;border-radius:8px;background:rgba(255,255,255,0.2);color:#fff;
            padding:6px 10px;cursor:pointer;transition:all 0.3s ease;display:flex;align-items:center;justify-content:center;">
            <i class="bi bi-clipboard" style="font-size:16px;"></i>
          </button>
        </div>
        <style>
          #copyCodeBtn:hover {
            background:rgba(255,255,255,0.3) !important;
            transform:scale(1.05);
          }
        </style>
      `,
      confirmButtonText: 'OK',
      confirmButtonColor: '#132fba',
      didOpen: () => {
        const btn = document.getElementById('copyCodeBtn');
        btn?.addEventListener('click', () => {
          navigator.clipboard.writeText(code);
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: 'Đã sao chép mã',
            showConfirmButton: false,
            timer: 1500
          });
        });
      }
    });
  }

  /** 🎁 ĐỔI VẬT PHẨM */
  async redeemItem(item: Items): Promise<void> {
    if (this.userPoints < item.pointsRequired) {
      await Swal.fire({
        icon: 'error',
        title: 'Không đủ điểm!',
        text: `Bạn cần thêm ${item.pointsRequired - this.userPoints} điểm để đổi vật phẩm này.`,
        confirmButtonColor: '#132fba'
      });
      return;
    }

    // Form điền thông tin theo hàng dọc
    const htmlForm = `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <div class="container-fluid px-2" style="max-width: 460px; text-align:left; font-size:15px;">
    <div class="mb-3">
      <label for="f_address" class="form-label fw-medium">Địa chỉ (số nhà, đường...)</label>
      <input type="text" id="f_address" class="form-control" placeholder="VD: 12 Nguyễn Huệ, P.Bến Nghé">
    </div>

    <div class="mb-3">
      <label for="f_province" class="form-label fw-medium">Tỉnh / Thành phố</label>
      <select id="f_province" class="form-select">
        <option value="">-- Chọn Tỉnh / Thành phố --</option>
        ${this.provinces
          .map(p => `<option value="${p.name}">${p.name}</option>`)
          .join('')}
      </select>
    </div>

    <div class="mb-3">
      <label for="f_district" class="form-label fw-medium">Quận / Huyện</label>
      <select id="f_district" class="form-select">
        <option value="">-- Chọn Quận / Huyện --</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="f_name" class="form-label fw-medium">Họ và tên</label>
      <input type="text" id="f_name" class="form-control" placeholder="Nguyễn Văn A">
    </div>

    <div class="mb-3">
      <label for="f_phone" class="form-label fw-medium">Số điện thoại</label>
      <input type="text" id="f_phone" class="form-control" placeholder="09xxxxxxxx">
    </div>

    <div id="ship_msg" class="fw-medium text-secondary mt-2"></div>
  </div>
`;

    const result = await Swal.fire({
      icon: 'question',
      title: `Đổi vật phẩm "${item.name}"?`,
      html: htmlForm,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Gửi thông tin',
      cancelButtonText: 'Huỷ',
      confirmButtonColor: '#132fba',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
  const provinceSelect = document.getElementById('f_province') as HTMLSelectElement;
  const districtSelect = document.getElementById('f_district') as HTMLSelectElement;
  const shipMsg = document.getElementById('ship_msg') as HTMLElement;

  provinceSelect.addEventListener('change', () => {
    const selected = this.provinces.find(p => p.name === provinceSelect.value);
    
    // ✅ FIXED: Sử dụng textContent và createElement thay vì innerHTML để tránh XSS
    districtSelect.textContent = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Chọn Quận / Huyện --';
    districtSelect.appendChild(defaultOption);
    
    (selected?.districts || []).forEach(d => {
      const option = document.createElement('option');
      option.value = d;
      option.textContent = d;
      districtSelect.appendChild(option);
    });

    // Làm trống khi chưa chọn tỉnh
    if (!provinceSelect.value) {
      shipMsg.textContent = '';
      return;
    }

    // ✅ FIXED: Sử dụng createElement thay vì innerHTML
    shipMsg.textContent = '';
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert d-flex align-items-center p-2 mb-0';
    alertDiv.setAttribute('role', 'alert');
    
    // Nếu là TP. Hồ Chí Minh → miễn phí ship
    if (provinceSelect.value === 'TP. Hồ Chí Minh') {
      alertDiv.classList.add('alert-success');
      alertDiv.style.cssText = 'background-color:#e9fbee; border:1px solid #b8e5c5; color:#117a53; border-radius:6px; margin-top:6px;';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'form-check-input me-2';
      checkbox.checked = true;
      checkbox.disabled = true;
      alertDiv.appendChild(checkbox);
      
      const textDiv = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = 'Miễn phí ship trong TP.HCM.';
      textDiv.appendChild(strong);
      alertDiv.appendChild(textDiv);
    } 
    // Ngoài TP.HCM → có phí
    else {
      alertDiv.classList.add('alert-warning');
      alertDiv.style.cssText = 'background-color:#fff9e8; border:1px solid #f2d98b; color:#946200; border-radius:6px; margin-top:6px;';
      
      const emojiDiv = document.createElement('div');
      emojiDiv.className = 'me-2';
      emojiDiv.textContent = '🚚';
      alertDiv.appendChild(emojiDiv);
      
      const textDiv = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = 'Phí ship 30.000đ (ngoài TP.HCM).';
      textDiv.appendChild(strong);
      alertDiv.appendChild(textDiv);
    }
    
    shipMsg.appendChild(alertDiv);
  });
},
      preConfirm: () => {
        const address = (document.getElementById('f_address') as HTMLInputElement)?.value?.trim();
        const province = (document.getElementById('f_province') as HTMLSelectElement)?.value?.trim();
        const district = (document.getElementById('f_district') as HTMLSelectElement)?.value?.trim();
        const name = (document.getElementById('f_name') as HTMLInputElement)?.value?.trim();
        const phone = (document.getElementById('f_phone') as HTMLInputElement)?.value?.trim();

        if (!address || !province || !district || !name || !phone) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ tất cả các trường.');
          return false;
        }
        if (phone.length < 9) {
          Swal.showValidationMessage('Số điện thoại không hợp lệ.');
          return false;
        }
        return { address, province, district, name, phone };
      }
    });

    if (!result.isConfirmed || !result.value) return;

    // Bước xác nhận lại trước khi trừ điểm
    const confirmRes = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận đổi vật phẩm?',
      html: `<p>Bạn chắc chắn muốn đổi <b>${item.name}</b>?</p>
       <p>Điểm cần đổi: <b>${item.pointsRequired.toLocaleString()}</b></p>`,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
      confirmButtonColor: '#132fba',
      cancelButtonColor: '#6c757d'
    });

    if (!confirmRes.isConfirmed) return;

    // Trừ điểm & hiện thông báo thành công
    this.userPoints -= item.pointsRequired;
    
    // Cập nhật coin vào users.json nếu đã đăng nhập
    if (this.isLoggedIn && this.currentUser) {
      this.updateUserCoin(this.userPoints);
    }
    const isHCM = result.value.province === 'TP. Hồ Chí Minh';
    const feeText = isHCM ? 'Miễn phí ship trong TP.HCM' : 'Phí ship 30.000đ';

    await Swal.fire({
      icon: 'success',
      title: 'Đổi quà thành công!',
      html: `
        <div class="text-start">
          <p><b>Vật phẩm:</b> ${item.name}</p>
          <p><b>Người nhận:</b> ${result.value.name}</p>
          <p><b>Địa chỉ:</b> ${result.value.address}, ${result.value.district}, ${result.value.province}</p>
          <p><b>SĐT:</b> ${result.value.phone}</p>
          <p><b>Chi phí:</b> ${feeText}</p>
          <p><b>Thời gian: </b>Quà sẽ được gửi trong 3-5 ngày làm việc.</p>
        </div>
      `,
      confirmButtonColor: '#0f89f3'
    });
  }

  // ✅ REMOVED: Không cần generate code nữa, chỉ hiển thị code gốc từ voucher.json

  /** 🖼️ Xử lý lỗi khi ảnh không load được */
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  /** 📷 Mở file picker để thay đổi ảnh voucher */
  changeVoucherImage(index: number): void {
    const fileInput = document.getElementById(`voucher-image-${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /** 📷 Mở file picker để thay đổi ảnh item */
  changeItemImage(index: number): void {
    const fileInput = document.getElementById(`item-image-${index}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /** 🖼️ Xử lý khi chọn ảnh voucher mới */
  onVoucherImageChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng chọn file ảnh hợp lệ!',
        confirmButtonColor: '#132fba'
      });
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Kích thước ảnh không được vượt quá 5MB!',
        confirmButtonColor: '#132fba'
      });
      return;
    }

    // Đọc file và cập nhật ảnh
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && this.vouchers[index]) {
        this.vouchers[index].img = result;
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã thay đổi hình ảnh voucher',
          confirmButtonColor: '#132fba',
          timer: 1500,
          showConfirmButton: false
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /** 🖼️ Xử lý khi chọn ảnh item mới */
  onItemImageChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng chọn file ảnh hợp lệ!',
        confirmButtonColor: '#132fba'
      });
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Kích thước ảnh không được vượt quá 5MB!',
        confirmButtonColor: '#132fba'
      });
      return;
    }

    // Đọc file và cập nhật ảnh
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && this.items[index]) {
        this.items[index].img = result;
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đã thay đổi hình ảnh vật phẩm',
          confirmButtonColor: '#132fba',
          timer: 1500,
          showConfirmButton: false
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /** 🔍 Áp dụng bộ lọc và tìm kiếm */
  applyFilters(): void {
    // Lọc voucher
    let vFiltered = [...this.vouchers];
    
    // Tìm kiếm
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      vFiltered = vFiltered.filter(v => 
        v.type.toLowerCase().includes(query) ||
        v.code.toLowerCase().includes(query)
      );
    }
    
    // Lọc theo điểm
    if (this.pointsFilter !== 'all') {
      vFiltered = vFiltered.filter(v => this.matchesPointsFilter(v.pointsRequired));
    }
    
    // Sắp xếp voucher
    vFiltered = this.sortItems(vFiltered, 'voucher');
    this.filteredVouchers = vFiltered;
    
    // Lọc items
    let iFiltered = [...this.items];
    
    // Tìm kiếm
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      iFiltered = iFiltered.filter(i => 
        i.name.toLowerCase().includes(query)
      );
    }
    
    // Lọc theo điểm
    if (this.pointsFilter !== 'all') {
      iFiltered = iFiltered.filter(i => this.matchesPointsFilter(i.pointsRequired));
    }
    
    // Sắp xếp items
    iFiltered = this.sortItems(iFiltered, 'item');
    this.filteredItems = iFiltered;
  }

  /** ✅ Kiểm tra điểm có khớp với bộ lọc không */
  private matchesPointsFilter(points: number): boolean {
    switch (this.pointsFilter) {
      case '0-200':
        return points >= 0 && points <= 200;
      case '200-400':
        return points > 200 && points <= 400;
      case '400-600':
        return points > 400 && points <= 600;
      case '600+':
        return points > 600;
      default:
        return true;
    }
  }

  /** 📊 Sắp xếp danh sách */
  private sortItems(items: any[], type: 'voucher' | 'item'): any[] {
    const sorted = [...items];
    
    // Sắp xếp theo điểm (ưu tiên)
    if (this.pointsSort === 'low') {
      sorted.sort((a, b) => a.pointsRequired - b.pointsRequired);
    } else if (this.pointsSort === 'high') {
      sorted.sort((a, b) => b.pointsRequired - a.pointsRequired);
    }
    
    // Sắp xếp theo tên (thứ yếu)
    if (this.nameSort === 'asc') {
      sorted.sort((a, b) => {
        const nameA = type === 'voucher' ? a.type : a.name;
        const nameB = type === 'voucher' ? b.type : b.name;
        return nameA.localeCompare(nameB, 'vi');
      });
    } else if (this.nameSort === 'desc') {
      sorted.sort((a, b) => {
        const nameA = type === 'voucher' ? a.type : a.name;
        const nameB = type === 'voucher' ? b.type : b.name;
        return nameB.localeCompare(nameA, 'vi');
      });
    }
    
    return sorted;
  }

  /** 🔄 Thay đổi category */
  changeCategory(category: string): void {
    this.selectedCategory = category;
  }

  /** 🔄 Thay đổi sắp xếp điểm */
  changePointsSort(sort: string): void {
    this.pointsSort = sort;
    this.applyFilters();
  }

  /** 🔄 Thay đổi sắp xếp tên */
  changeNameSort(sort: string): void {
    this.nameSort = sort;
    this.applyFilters();
  }

  /** 🔄 Thay đổi lọc điểm */
  changePointsFilter(filter: string): void {
    this.pointsFilter = filter;
    this.applyFilters();
  }

  /** 🔍 Tìm kiếm */
  onSearch(): void {
    this.applyFilters();
  }

  /** 🧹 Xóa tìm kiếm */
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  /** 🧹 Xóa bộ lọc */
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.pointsSort = 'none';
    this.nameSort = 'none';
    this.pointsFilter = 'all';
    this.applyFilters();
  }

  /** 🔍 Tìm index của voucher trong mảng gốc */
  getVoucherIndex(voucher: Voucher): number {
    return this.vouchers.findIndex(v => v.code === voucher.code);
  }

  /** 🔍 Tìm index của item trong mảng gốc */
  getItemIndex(item: Items): number {
    return this.items.findIndex(i => i.id === item.id);
  }
}
