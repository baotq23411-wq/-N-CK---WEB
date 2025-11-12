import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth';
import { catchError, EMPTY } from 'rxjs';
import { CommonModule } from '@angular/common';

export function emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = (control.value || '').toString().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{6,15}$/; // hỗ trợ +84... hoặc số thuần đã chuẩn hóa
  if (!value) return { required: true };
  return emailRegex.test(value) || phoneRegex.test(value) ? null : { emailOrPhone: true };
}

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // <-- thêm ReactiveFormsModule
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

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

    let value = control.value || '';
    // Nếu là chuỗi số, chuẩn hóa thành E.164 (+84...) để match data
    const isPhoneTyping = /^(\+?\d{0,15}|\d{0,15})$/.test(value);
    if (isPhoneTyping) {
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
    const { emailOrPhone, password } = this.loginForm.value;

    this.isLoading = true;
    this.authService.login(emailOrPhone, password).pipe(
      catchError((err) => {
        this.isLoading = false;
        if (err?.message === 'wrong_password') {
          Swal.fire('Đăng nhập thất bại!', 'Mật khẩu không đúng.', 'error');
          this.loginForm.get('password')?.reset();

        } else {
          Swal.fire('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.', 'error');
        }
        return EMPTY;
      })
    ).subscribe(() => {

    });
  }
}
