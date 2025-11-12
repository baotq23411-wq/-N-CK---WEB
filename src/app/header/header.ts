import { Component, HostListener, OnInit } from '@angular/core';
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

  membership = 'BRONZE PRIORITY';
  membershipClass = 'bronze';

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentAccount().subscribe({
      next: (acc) => {
        this.currentAccount = acc;
        this.calculateMembership(acc?.coin ?? 0);
      },
      error: () => {},
    });
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
  }

  calculateMembership(diem: number): void {
    if (diem >= 50_000_000) { this.membership = 'DIAMOND PRIORITY'; this.membershipClass = 'diamond'; }
    else if (diem >= 20_000_000) { this.membership = 'PLATINUM PRIORITY'; this.membershipClass = 'platinum-20m'; }
    else if (diem >= 2_500_000) { this.membership = 'GOLD PRIORITY'; this.membershipClass = 'gold'; }
    else if (diem >= 50_000) { this.membership = 'SILVER PRIORITY'; this.membershipClass = 'silver'; }
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
      reverseButtons: true
    }).then(res => {
      if (res.isConfirmed) {
        this.authService.logout();
        this.router.navigateByUrl('/');
        Swal.fire({ title: 'Đăng xuất thành công!', icon: 'success', timer: 1600 });
      }
    });
  }
}
