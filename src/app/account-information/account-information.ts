import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth';
import { UserService } from '../services/user';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';

@Component({
  selector: 'account-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-information.html',
  styleUrls: ['./account-information.css'],
})
export class AccountInformationComponent implements OnInit {
  user: User | null = null;
  editableUser: User | null = null;
  isEditing = false;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    /** Dùng observable từ AuthService để lấy user mới nhất */
    this.authService
      .getCurrentAccount()
      .pipe(take(1))
      .subscribe({
        next: (account) => {
          if (account) {
            this.user = structuredClone(account);
            this.editableUser = structuredClone(account);
          } else {
            console.warn('Không tìm thấy tài khoản đăng nhập');
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải tài khoản:', err);
        },
      });
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.editableUser = structuredClone(this.user);
    this.isEditing = false;
  }

  saveChanges(): void {
    if (!this.editableUser) return;

    /** Chuẩn hóa định dạng ngày sinh dd-mm-yyyy */
    if (this.editableUser.birthdate) {
      const parts = this.editableUser.birthdate.split(/[-/]/);
      if (parts.length === 3 && parts[0].length === 4) {
        // yyyy-mm-dd → dd-mm-yyyy
        this.editableUser.birthdate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    this.userService.updateUserInfo(this.editableUser).subscribe({
      next: (res) => {
        this.user = structuredClone(this.editableUser);
        this.isEditing = false;

        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          text: 'Thông tin tài khoản của bạn đã được lưu lại.',
          confirmButtonColor: '#132fba',
        });
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật:', err);
        Swal.fire({
          icon: 'error',
          title: 'Cập nhật thất bại',
          text: 'Đã xảy ra lỗi trong quá trình lưu thông tin.',
          confirmButtonColor: '#132fba',
        });
      },
    });
  }
}
