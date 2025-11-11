import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { catchError, EMPTY } from 'rxjs';

export function emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value?.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+?\d{1,3}[-\s]?)?(\d{10,15})$/;
  return emailRegex.test(value) || phoneRegex.test(value) ? null : { emailOrPhone: true };
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', [Validators.required, emailOrPhoneValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  formatLoginInput() {
    const control = this.loginForm.get('emailOrPhone');
    if (!control) return;

    let value = control.value;

    // Nếu người dùng nhập toàn số hoặc bắt đầu bằng 0/+, giả định là số điện thoại
    const isPhone = /^(\+?\d{0,15}|\d{0,15})$/.test(value);

    if (isPhone) {
      // Chỉ định dạng khi là số
      value = value.replace(/[^0-9+]/g, '');

      if (value.startsWith('0') && value.length === 10) {
        value = '+84' + value.substring(1);
      }

      control.setValue(value, { emitEvent: false });
    }
  }


  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).pipe(
      catchError((error) => {
        if (error.message === 'Sai mật khẩu') {
          Swal.fire('Đăng nhập thất bại!', 'Mật khẩu không đúng.', 'error');
          this.loginForm.get('password')?.reset();
        } else if (error.message === 'Email/Số điện thoại chưa đăng ký') {
          // Nếu chưa có tài khoản → chuyển thẳng tới trang đăng ký
          this.router.navigate(['/register']);
        } else {
          Swal.fire('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.', 'error');
        }
        return EMPTY;
      })
    ).subscribe(() => {
      // Đăng nhập thành công → chuyển đến trang BlogListPage
      this.router.navigate(['/blog']);
    });
  }
}
