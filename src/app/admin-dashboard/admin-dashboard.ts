import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  stats = {
    totalUsers: 0,
    totalBookings: 0,
    totalRooms: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Kiểm tra quyền admin
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadStats();
  }

  loadStats(): void {
    // Load users
    try {
      const usersStr = localStorage.getItem('USERS') || '[]';
      const users = JSON.parse(usersStr);
      this.stats.totalUsers = users.length;
    } catch (e) {
      console.error('Error loading users:', e);
    }

    // Load bookings
    try {
      fetch('/assets/data/bookings.json')
        .then(res => res.json())
        .then(bookings => {
          this.stats.totalBookings = bookings.length;
          this.stats.pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
          this.stats.completedBookings = bookings.filter((b: any) => b.status === 'completed').length;
          this.stats.totalRevenue = bookings.reduce((sum: number, b: any) => {
            if (b.status === 'completed' || b.status === 'confirmed') {
              return sum + (b.totalPrice || 0);
            }
            return sum;
          }, 0);
        })
        .catch(err => console.error('Error loading bookings:', err));
    } catch (e) {
      console.error('Error loading bookings:', e);
    }

    // Load rooms
    try {
      fetch('/assets/data/rooms.json')
        .then(res => res.json())
        .then(rooms => {
          this.stats.totalRooms = rooms.length;
        })
        .catch(err => console.error('Error loading rooms:', err));
    } catch (e) {
      console.error('Error loading rooms:', e);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  logout(): void {
    Swal.fire({
      title: 'Xác nhận đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#132fba',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          title: 'Đã đăng xuất!',
          text: 'Bạn đã đăng xuất thành công.',
          icon: 'success',
          confirmButtonColor: '#132fba'
        }).then(() => {
          this.router.navigate(['/']);
        });
      }
    });
  }
}

