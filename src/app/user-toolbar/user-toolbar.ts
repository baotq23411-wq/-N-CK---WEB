import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-user-toolbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-toolbar.html',
  styleUrls: ['./user-toolbar.css'],
})
export class UserToolbarComponent implements OnInit {
  currentAccount: any = null;
  membership: string = 'BRONZE PRIORITY';
  membershipClass: string = 'bronze';
  badgeUrl: string = 'https://i.imgur.com/fake-bronze.png'; // mặc định

  sidebarOpen: boolean = false;

  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.getCurrentAccount().subscribe({
      next: (account) => {
        if (account) {
          this.currentAccount = account;
          const star = typeof account.star === 'number' ? account.star : 0;
          this.setMembership(star);
        } else {
          this.currentAccount = {};
          this.setMembership(0);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy account:', err);
        this.currentAccount = {};
        this.setMembership(0);
      },
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  collapseSidebar(): void {
    this.sidebarOpen = false;
  }

  openMembershipLink(): void {
    window.open('https://vnexpress.net', '_blank');
  }

  /** Xác định cấp độ hội viên + badge */
  setMembership(star: number): void {
    if (star >= 100) {
      this.membership = 'DIAMOND PRIORITY';
      this.membershipClass = 'diamond';
      this.badgeUrl = '../../assets/images/ic_diamond_badge.png';
    } else if (star >= 50) {
      this.membership = 'PLATINUM PRIORITY';
      this.membershipClass = 'platinum';
      this.badgeUrl = '../../assets/images/ic_platinum_badge.png';
    } else if (star >= 20) {
      this.membership = 'GOLD PRIORITY';
      this.membershipClass = 'gold';
      this.badgeUrl = '../../assets/images/ic_gold_badge.png';
    } else if (star >= 5) {
      this.membership = 'SILVER PRIORITY';
      this.membershipClass = 'silver';
      this.badgeUrl = '../../assets/images/ic_silver_badge.png';
    } else {
      this.membership = 'BRONZE PRIORITY';
      this.membershipClass = 'bronze';
      this.badgeUrl = '../../assets/images/ic_bronze_badge.png';
    }
  }

  logout(): void {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn đăng xuất?',
      text: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng những ưu đãi đặc biệt!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['']);
        Swal.fire({
          title: 'Đăng xuất thành công!',
          text: 'Hẹn gặp lại.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  }
}
