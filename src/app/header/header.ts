import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit {
  isOpen = false;           // mobile menu
  scrolled = false;         // sticky shadow
  currentAccount: any = null;
  isAdmin: boolean = false;
  isDropdownOpen = false;  // user dropdown menu
  isSupportDropdownOpen = false;  // support dropdown menu (desktop)
  isMobileSupportDropdownOpen = false;  // support dropdown menu (mobile)
  isPolicyDropdownOpen = false;  // policy dropdown menu (desktop)

  membership = 'BRONZE PRIORITY';
  membershipClass = 'bronze';

  constructor(
    public authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load account từ users.json ngay khi component khởi tạo
    this.loadAccount();
    
    // Kiểm tra role admin
    this.isAdmin = this.authService.isAdmin();
    
    // ✅ FIXED: Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-drop')) {
        this.isDropdownOpen = false;
      }
      // Đóng support dropdown khi click ra ngoài (chỉ trên mobile/touch)
      if (window.innerWidth < 992 && !target.closest('.support-dropdown') && !target.closest('.mobile-dropdown')) {
        this.isSupportDropdownOpen = false;
        this.isMobileSupportDropdownOpen = false;
      }
      // Đóng policy dropdown khi click ra ngoài (chỉ trên mobile/touch)
      if (window.innerWidth < 992 && !target.closest('.policy-dropdown')) {
        this.isPolicyDropdownOpen = false;
      }
    });

    // ✅ FIXED: Đóng support và policy dropdown khi resize window (chuyển từ desktop sang mobile)
    window.addEventListener('resize', () => {
      if (window.innerWidth < 992) {
        this.isSupportDropdownOpen = false;
        this.isPolicyDropdownOpen = false;
      }
    });
    
    // Subscribe trực tiếp đến currentAccount$ để cập nhật ngay lập tức khi đăng nhập
    this.authService.currentAccount$.subscribe({
      next: (acc) => {
        if (acc) {
          // Reload account từ users.json khi có thay đổi (sau khi đăng nhập)
          // Dữ liệu đã được sync vào localStorage trong AuthService.login()
          this.loadAccount();
          this.isAdmin = this.authService.isAdmin();
        } else {
          // Khi đăng xuất, reset về mặc định
          this.currentAccount = null;
          this.isAdmin = false;
          this.membership = 'BRONZE PRIORITY';
          this.membershipClass = 'bronze';
          this.isDropdownOpen = false;
        }
      }
    });
  }

  loadAccount(): void {
    // Đảm bảo lấy dữ liệu mới nhất từ USERS list (đã được sync từ users.json trong AuthService.login())
    const usersStr = localStorage.getItem('USERS');
    const uid = localStorage.getItem('UID');
    
    if (usersStr && uid) {
      try {
        const users = JSON.parse(usersStr);
        // Tìm user trong USERS list (đã được sync từ users.json)
        const user = users.find((u: any) => u.user_id === uid);
        if (user) {
          // Lấy đúng dữ liệu từ users.json (bao gồm full_name, coin, star, role)
          // Đảm bảo không dùng dữ liệu cũ, luôn lấy từ users.json
          const account = {
            id: parseInt(user.user_id?.replace('US', '') || '0') || 0,
            ho_ten: user.full_name || 'Username', // Lấy tên từ users.json
            email: user.email || '',
            phone_number: user.phone_number || '',
            diem_tich_luy: user.star || 0, // Lấy star từ users.json
            diem_kha_dung: user.coin || 0, // Lấy coin (điểm) từ users.json
            star: user.star || 0 // Lấy star từ users.json
          };
          
          // Cập nhật account
          this.currentAccount = account;
          
          // Cập nhật membership dựa trên star từ users.json
          this.calculateMembership(account.diem_tich_luy);
          
          // Cập nhật lại CURRENT_USER với dữ liệu mới nhất từ users.json
          localStorage.setItem('CURRENT_USER', JSON.stringify(user));
          
          // Cập nhật lại role admin từ users.json
          this.isAdmin = this.authService.isAdmin();
          
          // Force change detection để đảm bảo UI được cập nhật
          this.cdr.detectChanges();
        } else {
          // Nếu không tìm thấy trong USERS, thử lấy từ CURRENT_USER
          this.loadFromCurrentUser();
        }
      } catch (e) {
        console.error('Error loading account from USERS list:', e);
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
        // Đảm bảo lấy đúng dữ liệu từ CURRENT_USER (đã được sync từ users.json)
        const account = {
          id: parseInt(user.user_id?.replace('US', '') || '0') || 0,
          ho_ten: user.full_name || 'Username', // Lấy từ users.json
          email: user.email || '',
          phone_number: user.phone_number || '',
          diem_tich_luy: user.star || 0, // Lấy star từ users.json
          diem_kha_dung: user.coin || 0, // Lấy coin từ users.json
          star: user.star || 0
        };
        this.currentAccount = account;
        // Cập nhật membership dựa trên star từ users.json
        this.calculateMembership(account.diem_tich_luy);
        
        // Cập nhật lại role admin
        this.isAdmin = this.authService.isAdmin();
      } catch (e) {
        console.error('Error loading account from CURRENT_USER:', e);
        // Nếu parse lỗi, reset về mặc định
        this.currentAccount = null;
        this.membership = 'BRONZE PRIORITY';
        this.membershipClass = 'bronze';
        this.isAdmin = false;
      }
    } else {
      // Nếu không có CURRENT_USER, reset về mặc định
      this.currentAccount = null;
      this.membership = 'BRONZE PRIORITY';
      this.membershipClass = 'bronze';
      this.isAdmin = false;
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 8;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
  closeMenu() {
    this.isOpen = false;
    this.isMobileSupportDropdownOpen = false;
  }

  // ✅ FIXED: Toggle dropdown menu (chỉ mở khi click vào icon)
  toggleDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // ✅ FIXED: Đóng dropdown menu
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // ✅ FIXED: Điều hướng đến trang tài khoản (backup method nếu cần)
  gotoAccount() {
    this.router.navigate(['/customer-account/account-information']);
  }

  // ✅ FIXED: Support dropdown methods (desktop - hover)
  openSupportDropdown() {
    // Chỉ mở trên desktop (màn hình >= 992px)
    if (window.innerWidth >= 992) {
      this.isSupportDropdownOpen = true;
    }
  }

  closeSupportDropdown() {
    this.isSupportDropdownOpen = false;
  }

  toggleSupportDropdown(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isSupportDropdownOpen = !this.isSupportDropdownOpen;
  }

  // ✅ FIXED: Support dropdown methods (mobile - tap)
  toggleMobileSupportDropdown() {
    this.isMobileSupportDropdownOpen = !this.isMobileSupportDropdownOpen;
  }

  // ✅ FIXED: Policy dropdown methods (desktop - hover)
  openPolicyDropdown() {
    // Chỉ mở trên desktop (màn hình >= 992px)
    if (window.innerWidth >= 992) {
      this.isPolicyDropdownOpen = true;
    }
  }

  closePolicyDropdown() {
    this.isPolicyDropdownOpen = false;
  }

  togglePolicyDropdown(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isPolicyDropdownOpen = !this.isPolicyDropdownOpen;
  }

  calculateMembership(diem: number): void {
    // Theo hình ảnh: Diamond (100 sao), Platinum (50 sao), Gold (20 sao), Silver (5 sao), Bronze (0 sao)
    if (diem >= 100) { this.membership = 'DIAMOND PRIORITY'; this.membershipClass = 'diamond'; }
    else if (diem >= 50) { this.membership = 'PLATINUM PRIORITY'; this.membershipClass = 'platinum-20m'; }
    else if (diem >= 20) { this.membership = 'GOLD PRIORITY'; this.membershipClass = 'gold'; }
    else if (diem >= 5) { this.membership = 'SILVER PRIORITY'; this.membershipClass = 'silver'; }
    else { this.membership = 'BRONZE PRIORITY'; this.membershipClass = 'bronze'; }
  }

  logout() {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn đăng xuất?',
      text: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng những ưu đãi!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#132fba',
      reverseButtons: true
    }).then(res => {
      if (res.isConfirmed) {
        this.authService.logout();
        this.router.navigateByUrl('/');
        Swal.fire({ 
          title: 'Đăng xuất thành công!', 
          icon: 'success', 
          confirmButtonColor: '#132fba',
          timer: 1600 
        });
      }
    });
  }
}
