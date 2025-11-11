import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserToolbarComponent } from '../user-toolbar/user-toolbar';
import { Booking } from '../interfaces/booking';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, FormsModule, UserToolbarComponent],
  templateUrl: './booking-history.html',
  styleUrls: ['./booking-history.css'],
})
export class BookingHistoryComponent implements OnInit {
  bookings: Booking[] = [];
  selectedBooking: Booking | null = null;
  showModal = false;

  ngOnInit(): void {
    // 🔹 Lấy dữ liệu từ file JSON trong thư mục assets/data
    fetch('assets/data/bookings.json')
      .then(res => res.json())
      .then((data: Booking[]) => {
        this.bookings = data;
      })
      .catch(err => console.error('Lỗi khi tải bookings:', err));
  }

  // Trả về class CSS tương ứng trạng thái
  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + ' ₫';
  }

  openModal(booking: Booking): void {
    this.selectedBooking = booking;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBooking = null;
  }
}
