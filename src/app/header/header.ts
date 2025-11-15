import { Component, HostListener, OnInit, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isOpen = false;           // mobile menu drawer
  scrolled = false;         // sticky shadow
  currentAccount: any = null;
  isAdmin: boolean = false;
  isDropdownOpen = false;  // user dropdown menu
  isSupportDropdownOpen = false;  // support dropdown menu (desktop)
  isMobileSupportDropdownOpen = false;  // support dropdown menu (mobile)
  isPolicyDropdownOpen = false;  // policy dropdown menu (desktop)
  isAboutDropdownOpen = false;  // about dropdown menu (desktop)
  isMobileAboutDropdownOpen = false;  // about dropdown menu (mobile)
  isMoreDropdownOpen = false;  // more dropdown menu (tablet)

  membership = 'BRONZE PRIORITY';
  membershipClass = 'bronze';

  private lastFocusedElement: HTMLElement | null = null;
  private routerSubscription?: Subscription;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;

  @ViewChild('drawer', { static: false }) drawerRef?: ElementRef<HTMLElement>;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Load account từ users.json ngay khi component khởi tạo
    this.loadAccount();
    
    // Kiểm tra role admin
    this.isAdmin = this.authService.isAdmin();
    
    // ✅ FIXED: Đóng dropdown khi click ra ngoài
    // Sử dụng bubbling phase (mặc định) để chạy SAU các handler khác
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Bỏ qua nếu click vào user-info-wrapper, user-drop, menu-item, dropdown-arrow, hoặc user-header
      // (các phần tử này đã có handler riêng và đã gọi stopPropagation)
      const clickedInsideUserDropdown = 
        target.closest('.user-info-wrapper') || 
        target.closest('.user-drop') || 
        target.closest('.menu-item') || 
        target.closest('.dropdown-arrow') || 
        target.closest('.user-header');
      
      if (clickedInsideUserDropdown) {
        return; // Không đóng dropdown, để các handler riêng xử lý
      }
      
      // Chỉ đóng user dropdown nếu click ra ngoài hoàn toàn
      // Delay một chút để đảm bảo các click handler khác đã chạy xong
      setTimeout(() => {
        // Kiểm tra lại một lần nữa để đảm bảo dropdown vẫn đang mở và không click vào bên trong
        if (this.isDropdownOpen) {
          const mouseEvent = event as MouseEvent;
          const currentTarget = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY) as HTMLElement;
          const stillInside = 
            currentTarget?.closest('.user-info-wrapper') || 
            currentTarget?.closest('.user-drop') || 
            currentTarget?.closest('.menu-item') || 
            currentTarget?.closest('.dropdown-arrow') || 
            currentTarget?.closest('.user-header');
          
          if (!stillInside) {
            this.isDropdownOpen = false;
            this.cdr.detectChanges();
          }
        }
      }, 10);
      
      // Đóng support dropdown khi click ra ngoài (chỉ trên mobile/touch)
      if (window.innerWidth < 992 && !target.closest('.support-dropdown') && !target.closest('.drawer-dropdown')) {
        this.isSupportDropdownOpen = false;
        this.isMobileSupportDropdownOpen = false;
      }
      // Đóng policy dropdown khi click ra ngoài (chỉ trên mobile/touch)
      if (window.innerWidth < 992 && !target.closest('.policy-dropdown')) {
        this.isPolicyDropdownOpen = false;
      }
      // Đóng about dropdown khi click ra ngoài (chỉ trên mobile/touch)
      if (window.innerWidth < 992 && !target.closest('.about-dropdown') && !target.closest('.drawer-dropdown-about')) {
        this.isAboutDropdownOpen = false;
        this.isMobileAboutDropdownOpen = false;
      }
      // Đóng more dropdown khi click ra ngoài
      if (!target.closest('.more-dropdown')) {
        this.isMoreDropdownOpen = false;
      }
    }); // Sử dụng bubbling phase (mặc định) để chạy SAU các handler khác

    // ✅ FIXED: Đóng support và policy dropdown khi resize window (chuyển từ desktop sang mobile)
    window.addEventListener('resize', () => {
      if (window.innerWidth < 992) {
        this.isSupportDropdownOpen = false;
        this.isPolicyDropdownOpen = false;
        this.isAboutDropdownOpen = false;
        this.isMoreDropdownOpen = false;
      }
      // Đóng drawer khi resize từ mobile sang desktop
      if (window.innerWidth >= 768 && this.isOpen) {
        this.closeMenu();
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

    // ✅ FIXED: Đóng drawer khi navigate
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
  }

  ngAfterViewInit(): void {
    // Initialize focus trap elements after view init
    this.updateFocusableElements();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
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
            diem_kha_dung: user.coin || 0, // Lấy coin (xu) từ users.json
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

  // ✅ FIXED: Keyboard handler for Escape key
  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.closeMenu();
    }

    // Focus trap trong drawer
    if (this.isOpen && event.key === 'Tab') {
      this.handleFocusTrap(event);
    }
  }

  // ✅ FIXED: Focus trap implementation
  private handleFocusTrap(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) return;

    const isTabPressed = event.key === 'Tab' && !event.shiftKey;
    const isShiftTabPressed = event.key === 'Tab' && event.shiftKey;

    if (isTabPressed) {
      // Tab: nếu đang ở element cuối, chuyển về element đầu
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    } else if (isShiftTabPressed) {
      // Shift+Tab: nếu đang ở element đầu, chuyển về element cuối
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    }
  }

  // ✅ FIXED: Update focusable elements trong drawer
  private updateFocusableElements(): void {
    const drawer = document.getElementById('site-drawer');
    if (!drawer) {
      this.focusableElements = [];
      this.firstFocusableElement = null;
      this.lastFocusableElement = null;
      return;
    }

    // Tìm tất cả các element có thể focus được
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      drawer.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      // Loại bỏ các element bị ẩn
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  toggle(): void {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu(): void {
    this.isOpen = true;
    // Lưu element đang focus
    this.lastFocusedElement = document.activeElement as HTMLElement;
    
    // Prevent body scroll khi drawer mở
    document.body.style.overflow = 'hidden';
    
    // Update focusable elements và focus vào close button
    setTimeout(() => {
      this.updateFocusableElements();
      const closeButton = document.querySelector('.drawer-close') as HTMLElement;
      if (closeButton) {
        closeButton.focus();
      } else if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      }
    }, 100);
    
    this.cdr.detectChanges();
  }

  closeMenu(): void {
    this.isOpen = false;
    this.isMobileSupportDropdownOpen = false;
    this.isMobileAboutDropdownOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus về element trước đó
    if (this.lastFocusedElement) {
      setTimeout(() => {
        this.lastFocusedElement?.focus();
        this.lastFocusedElement = null;
      }, 100);
    }
    
    this.cdr.detectChanges();
  }

  // ✅ FIXED: Helper method để check active route
  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  // ✅ FIXED: Toggle dropdown menu (mở/đóng khi click vào mũi tên hoặc user-header)
  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation(); // Ngăn event bubble lên document để tránh document listener đóng dropdown ngay
    event.stopImmediatePropagation(); // Ngăn các handler khác trên cùng element
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Dropdown toggled:', this.isDropdownOpen); // Debug log
    this.cdr.detectChanges();
  }

  // ✅ FIXED: Mở dropdown menu (khi hover)
  openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;
      this.cdr.detectChanges();
    }
  }

  // ✅ FIXED: Đóng dropdown menu
  closeDropdown(): void {
    // Delay một chút để đảm bảo navigation được thực hiện trước
    setTimeout(() => {
      this.isDropdownOpen = false;
      this.cdr.detectChanges();
    }, 100);
  }

  // ✅ FIXED: Đóng dropdown khi rời chuột (chỉ khi không hover vào panel)
  closeDropdownOnLeave(event: MouseEvent): void {
    // Delay một chút để kiểm tra xem chuột có di chuyển vào dropdown không
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as HTMLElement;
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      
      // Kiểm tra xem chuột có đang ở trong user-info-wrapper hoặc user-drop không
      const isInsideDropdown = 
        (relatedTarget && (relatedTarget.closest('.user-info-wrapper') || relatedTarget.closest('.user-drop'))) ||
        (elementAtPoint && (elementAtPoint.closest('.user-info-wrapper') || elementAtPoint.closest('.user-drop')));
      
      if (!isInsideDropdown) {
        this.isDropdownOpen = false;
        this.cdr.detectChanges();
      }
    }, 150);
  }

  // ✅ FIXED: Xử lý click vào user wrapper (chỉ mở dropdown, không redirect)
  handleUserWrapperClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Nếu click vào menu item hoặc user-drop, không làm gì (để các handler riêng xử lý)
    if (target.closest('.menu-item') || target.closest('.user-drop')) {
      return;
    }
    // Nếu click vào dropdown arrow, đã có handler riêng, không cần xử lý ở đây
    if (target.closest('.dropdown-arrow')) {
      return;
    }
    // Nếu click vào phần header (tên, xu, hoặc bất kỳ đâu trong user-header), toggle dropdown
    if (target.closest('.user-header')) {
      event.stopPropagation(); // Ngăn event bubble lên document để tránh document listener đóng dropdown
      event.stopImmediatePropagation(); // Ngăn các handler khác
      console.log('handleUserWrapperClick - toggling dropdown'); // Debug log
      this.toggleDropdown(event);
    }
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

  // ✅ FIXED: About dropdown methods (desktop - hover)
  openAboutDropdown() {
    // Chỉ mở trên desktop (màn hình >= 992px)
    if (window.innerWidth >= 992) {
      this.isAboutDropdownOpen = true;
    }
  }

  closeAboutDropdown() {
    this.isAboutDropdownOpen = false;
  }

  toggleAboutDropdown(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isAboutDropdownOpen = !this.isAboutDropdownOpen;
  }

  // ✅ FIXED: About dropdown methods (mobile - tap)
  toggleMobileAboutDropdown() {
    this.isMobileAboutDropdownOpen = !this.isMobileAboutDropdownOpen;
  }

  // ✅ FIXED: More dropdown methods (tablet)
  openMoreDropdown() {
    if (window.innerWidth >= 768 && window.innerWidth < 992) {
      this.isMoreDropdownOpen = true;
    }
  }

  closeMoreDropdown() {
    this.isMoreDropdownOpen = false;
  }

  toggleMoreDropdown(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isMoreDropdownOpen = !this.isMoreDropdownOpen;
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
