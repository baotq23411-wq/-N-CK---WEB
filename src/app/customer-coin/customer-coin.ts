import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../services/auth';
import { UserToolbarComponent } from "../user-toolbar/user-toolbar";
import { CommonModule } from '@angular/common';

interface MembershipInfo {
  level: string;
  nextThreshold: number;
  coinsNeeded: number;
  nextLevel?: string;
}
type CoinStatusTab = 'all' | 'processing' | 'expired' | 'done';

@Component({
  selector: 'app-cus-coin',
  standalone: true,
  imports: [UserToolbarComponent, CommonModule],
  templateUrl: './customer-coin.html',
  styleUrls: ['./customer-coin.css']
})
export class CustomerCoinComponent implements OnInit {
  membershipInfo!: MembershipInfo;
  currentAccount: any;
  currentDate: string = new Date().toLocaleDateString('vi-VN');
  expiringPoints: number = 50;
  expiringDate: string = '31/12/2025';

  showAboutModal = false;
  showHistoryModal = false;
  selectedHistory: any = null;

  // Tabs
  activeTab: CoinStatusTab = 'all';

  // Dữ liệu mẫu
  coinHistory = [
    { date: '01/11/2025', description: 'Đổi voucher giảm giá 10%', amount: -100, status: 'Hoàn tất', icon: 'bi bi-ticket-perforated' },
    { date: '25/10/2025', description: 'Nhận thưởng sự kiện “Tri Ân Khách Hàng”', amount: +500, status: 'Hoàn tất', icon: 'bi bi-gift' },
    { date: '15/10/2025', description: 'Đổi gấu bông Panacea', amount: -200, status: 'Đang xử lý', icon: 'bi bi-bag-heart' },
    { date: '02/10/2025', description: 'Tham gia Workshop “Du lịch xanh”', amount: +300, status: 'Hoàn tất', icon: 'bi bi-calendar-event' }
  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getCurrentAccount().subscribe(account => {
      const star = account?.star ?? 0;
      this.currentAccount = account;
      this.membershipInfo = this.calculateMembership(star);
    });
  }

  calculateMembership(star: number): MembershipInfo {
    if (star >= 100) {
      return { level: 'DIAMOND PRIORITY', nextThreshold: 0, coinsNeeded: 0 };
    } else if (star >= 50) {
      return { level: 'PLATINUM PRIORITY', nextThreshold: 50000000, coinsNeeded: 50000000 - star, nextLevel: 'DIAMOND PRIORITY' };
    } else if (star >= 20) {
      return { level: 'GOLD PRIORITY', nextThreshold: 20000000, coinsNeeded: 20000000 - star, nextLevel: 'PLATINUM PRIORITY' };
    } else if (star >= 5) {
      return { level: 'SILVER PRIORITY', nextThreshold: 2500000, coinsNeeded: 2500000 - star, nextLevel: 'GOLD PRIORITY' };
    } else {
      return { level: 'BRONZE PRIORITY', nextThreshold: 50000, coinsNeeded: 50000 - star, nextLevel: 'SILVER PRIORITY' };
    }
  }

  calcProgressPercent(star: number): number {
    const next = this.membershipInfo.nextThreshold;
    if (next === 0) return 100;
    const prev =
      this.membershipInfo.level === 'SILVER PRIORITY' ? 50000 :
        this.membershipInfo.level === 'GOLD PRIORITY' ? 2500000 :
          this.membershipInfo.level === 'PLATINUM PRIORITY' ? 20000000 : 0;
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

  // ====== Tabs + Filter giống booking-history ======
  mapStatus(item: any): CoinStatusTab {
    const s = (item?.status || '').toLowerCase();
    if (s.includes('xử lý')) return 'processing';
    if (s.includes('quá hạn')) return 'expired';
    if (s.includes('hoàn tất') || s.includes('hoan tat')) return 'done';
    return 'processing';
  }
  displayStatus(item: any): string {
    const code = this.mapStatus(item);
    return code === 'processing' ? 'Đang xử lý'
      : code === 'expired' ? 'Xu quá hạn'
        : code === 'done' ? 'Hoàn tất'
          : 'Đang xử lý';
  }
  setTab(tab: CoinStatusTab) { this.activeTab = tab; }
  get filteredCoinHistory() {
    if (this.activeTab === 'all') return this.coinHistory;
    return this.coinHistory.filter(i => this.mapStatus(i) === this.activeTab);
  }

  getStatusClass(item: any): string {
    const code = this.mapStatus(item); // 'processing' | 'expired' | 'done'
    switch (code) {
      case 'processing': return 'status-processing';
      case 'expired': return 'status-expired';
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
