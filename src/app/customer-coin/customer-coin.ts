import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from '../services/auth';
import { UserToolbarComponent } from "../user-toolbar/user-toolbar";
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface MembershipInfo {
  level: string;
  nextThreshold: number;
  coinsNeeded: number;
  nextLevel?: string;
}

type CoinTab = 'all' | 'processing' | 'increase' | 'decrease';

@Component({
  selector: 'app-cus-coin',
  standalone: true,
  imports: [UserToolbarComponent, CommonModule],
  templateUrl: './customer-coin.html',
  styleUrls: ['./customer-coin.css']
})
export class CustomerCoinComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  membershipInfo!: MembershipInfo;
  currentAccount: any;
  currentDate: string = new Date().toLocaleDateString('vi-VN');

  showAboutModal = false;
  showHistoryModal = false;
  selectedHistory: any = null;

  // Tabs
  activeTab: CoinTab = 'all';

  // Dữ liệu mẫu
  coinHistory = [
    { date: '01/11/2025', description: 'Đổi voucher giảm giá 10%', amount: -100, status: 'Hoàn tất', icon: 'bi bi-ticket-perforated' },
    { date: '25/10/2025', description: 'Nhận thưởng sự kiện "Tri Ân Khách Hàng"', amount: +500, status: 'Hoàn tất', icon: 'bi bi-gift' },
    { date: '15/10/2025', description: 'Đổi gấu bông Panacea', amount: -200, status: 'Đang xử lý', icon: 'bi bi-bag-heart' },
    { date: '02/10/2025', description: 'Tham gia Workshop "Du lịch xanh"', amount: +300, status: 'Hoàn tất', icon: 'bi bi-calendar-event' },
    { date: '20/09/2025', description: 'Nhận xu từ đặt phòng', amount: +1000, status: 'Hoàn tất', icon: 'bi bi-cash-coin' },
    { date: '10/09/2025', description: 'Đổi voucher giảm giá 20%', amount: -150, status: 'Hoàn tất', icon: 'bi bi-ticket-perforated' },
    { date: '05/09/2025', description: 'Nhận xu từ đánh giá', amount: +50, status: 'Hoàn tất', icon: 'bi bi-star-fill' }
  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Subscribe để cập nhật khi có thay đổi
    this.authService.getCurrentAccount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        if (account) {
          this.loadUserData(account);
        } else {
          this.currentAccount = null;
          this.membershipInfo = this.calculateMembership(0);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load dữ liệu từ users.json */
  private loadUserData(account: any): void {
    try {
      const usersStr = localStorage.getItem('USERS');
      const uid = localStorage.getItem('UID');
      let userCoin = 0;
      
      // Ưu tiên lấy từ USERS list
      if (usersStr && uid) {
        const users = JSON.parse(usersStr);
        const user = users.find((u: any) => u.user_id === uid);
        if (user) {
          userCoin = user.coin || 0;
        }
      }
      
      // Nếu không tìm thấy, thử lấy từ CURRENT_USER
      if (userCoin === 0) {
        const currentUserStr = localStorage.getItem('CURRENT_USER');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          userCoin = currentUser.coin || 0;
        }
      }
      
      // Cập nhật currentAccount với coin từ users.json
      this.currentAccount = {
        ...account,
        coin: userCoin
      };
      const star = account.star ?? 0;
      this.membershipInfo = this.calculateMembership(star);
    } catch (e) {
      console.error('Error loading user data:', e);
      // Fallback: sử dụng account từ authService
      const star = account?.star ?? 0;
      this.currentAccount = account;
      this.membershipInfo = this.calculateMembership(star);
    }
  }

  calculateMembership(star: number): MembershipInfo {
    // ✅ FIXED: Logic tính membership dựa trên sao (star), không phải coin
    // Tương tự như customer-star.ts
    if (star >= 100) {
      return { 
        level: 'DIAMOND PRIORITY', 
        nextThreshold: 0, 
        coinsNeeded: 0 
      };
    } else if (star >= 50) {
      return { 
        level: 'PLATINUM PRIORITY', 
        nextThreshold: 100, 
        coinsNeeded: 100 - star, 
        nextLevel: 'DIAMOND PRIORITY' 
      };
    } else if (star >= 20) {
      return { 
        level: 'GOLD PRIORITY', 
        nextThreshold: 50, 
        coinsNeeded: 50 - star, 
        nextLevel: 'PLATINUM PRIORITY' 
      };
    } else if (star >= 5) {
      return { 
        level: 'SILVER PRIORITY', 
        nextThreshold: 20, 
        coinsNeeded: 20 - star, 
        nextLevel: 'GOLD PRIORITY' 
      };
    } else {
      return { 
        level: 'BRONZE PRIORITY', 
        nextThreshold: 5, 
        coinsNeeded: 5 - star, 
        nextLevel: 'SILVER PRIORITY' 
      };
    }
  }

  calcProgressPercent(star: number): number {
    // ✅ FIXED: Logic tính progress dựa trên sao (star), không phải coin
    const next = this.membershipInfo.nextThreshold;
    if (next === 0) return 100;
    
    const prev =
      this.membershipInfo.level === 'SILVER PRIORITY' ? 5 :
        this.membershipInfo.level === 'GOLD PRIORITY' ? 20 :
          this.membershipInfo.level === 'PLATINUM PRIORITY' ? 50 : 0;
    
    return Math.min(((star - prev) / (next - prev)) * 100, 100);
  }

  // ====== Actions (giữ nguyên modal) ======
  openAboutPoint(): void { this.showAboutModal = true; document.body.style.overflow = 'hidden'; }
  closeAboutPoint(): void { this.showAboutModal = false; document.body.style.overflow = ''; }
  openLearnHow(): void { window.open('/coin', '_blank'); }
  @HostListener('document:keydown.escape') onEsc() { if (this.showAboutModal) this.closeAboutPoint(); }

  // Modal lịch sử
  openHistoryDetail(item: any): void {
    this.selectedHistory = item;
    this.showHistoryModal = true;
    document.body.style.overflow = 'hidden';
  }
  closeHistoryDetail(): void {
    this.showHistoryModal = false;
    this.selectedHistory = null;
    document.body.style.overflow = '';
  }

  // ====== Tabs + Filter ======
  mapStatus(item: any): 'processing' | 'done' {
    const s = (item?.status || '').toLowerCase();
    if (s.includes('xử lý')) return 'processing';
    if (s.includes('hoàn tất') || s.includes('hoan tat')) return 'done';
    return 'processing';
  }
  
  displayStatus(item: any): string {
    const code = this.mapStatus(item);
    return code === 'processing' ? 'Đang xử lý'
      : code === 'done' ? 'Hoàn tất'
        : 'Đang xử lý';
  }
  
  setTab(tab: CoinTab): void {
    this.activeTab = tab;
  }
  
  get filteredCoinHistory() {
    let filtered = this.coinHistory;
    
    if (this.activeTab === 'all') {
      return filtered;
    } else if (this.activeTab === 'processing') {
      filtered = filtered.filter(i => this.mapStatus(i) === 'processing');
    } else if (this.activeTab === 'increase') {
      filtered = filtered.filter(i => i.amount > 0);
    } else if (this.activeTab === 'decrease') {
      filtered = filtered.filter(i => i.amount < 0);
    }
    
    return filtered;
  }

  getStatusClass(item: any): string {
    const code = this.mapStatus(item); // 'processing' | 'done'
    switch (code) {
      case 'processing': return 'status-processing';
      case 'done': return 'status-done';
      default: return 'status-processing';
    }
  }

  // (Tuỳ chọn) format số xu nếu bạn muốn chuẩn hoá
  formatCoin(amount: number): string {
    const sign = amount > 0 ? '+' : '';
    return `${sign}${amount}`;
  }
}
