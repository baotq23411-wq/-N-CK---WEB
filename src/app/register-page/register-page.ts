import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { UserService } from '../services/user'; 

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: AbstractControl) => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);
    if (!control || !matchingControl) return null;
    if (matchingControl.errors && !matchingControl.errors['mustMatch']) return null;
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css'],
})
export class RegisterPageComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        full_name: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ ]+$')]],
        email: ['', [Validators.required, Validators.email]],
        phone_number: ['', [Validators.required, Validators.pattern('^(\\+\\d{1,3})?\\d{10,16}$')]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', Validators.required],
      },
      { validators: MustMatch('password', 'confirm_password') }
    );
  }

  formatPhoneNumber() {
    let phoneControl = this.registerForm.get('phone_number');
    if (!phoneControl) return;
    let value = phoneControl.value.replace(/[^0-9+]/g, '');
    if (value.startsWith('0') && value.length === 10) {
      value = '+84' + value.slice(1);
    }
    phoneControl.setValue(value, { emitEvent: false });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.value;
    delete payload.confirm_password;

    this.userService.register(payload).pipe(
      catchError((err) => {
        Swal.fire('Lỗi', 'Đăng ký thất bại! Hãy thử lại.', 'error');
        return EMPTY;
      })
    ).subscribe(() => {
      Swal.fire('Thành công', 'Đăng ký thành công!', 'success').then(() => {
        this.router.navigate(['/login']);
      });
    });
  }
}
