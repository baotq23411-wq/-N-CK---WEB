import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'USERS';
  private readonly CURRENT_KEY = 'CURRENT_USER';

  constructor(private http: HttpClient) {
    this.seedUsersOnce();
  }

  /** Lần đầu chạy app -> load users.json vào localStorage (nếu chưa có) */
  private seedUsersOnce() {
    if (localStorage.getItem(this.USERS_KEY)) return;

    const tryPaths = ['/assets/data/users.json', 'assets/data/users.json'];

    const tryFetch = (i: number) => {
      if (i >= tryPaths.length) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
        return;
      }

      fetch(tryPaths[i])
        .then((res) => (res.ok ? res.json() : []))
        .then((data: User[]) => {
          localStorage.setItem(
            this.USERS_KEY,
            JSON.stringify(Array.isArray(data) ? data : [])
          );
        })
        .catch(() => tryFetch(i + 1));
    };

    tryFetch(0);
  }

  /** Lấy tất cả user từ localStorage */
  private getAllUsers(): User[] {
    const usersString = localStorage.getItem(this.USERS_KEY);
    return usersString ? JSON.parse(usersString) : [];
  }

  /** Chuẩn hóa số điện thoại */
  private normalizePhone(p?: string): string {
    if (!p) return '';
    return p.toString().replace(/[^\d+]/g, '');
  }

  /** Chuẩn hóa email */
  private normalizeEmail(e?: string): string {
    return (e || '').toLowerCase().trim();
  }

  /** Xử lý đăng nhập */
  login(emailOrPhone: string, password: string): Observable<User> {
    const users = this.getAllUsers();
    const raw = (emailOrPhone || '').toString().trim();

    const isEmail = /\S+@\S+\.\S+/.test(raw);
    const normalizedInputPhone = this.normalizePhone(raw);
    const normalizedInputEmail = this.normalizeEmail(raw);

    const user = users.find((u) => {
      const userEmail = this.normalizeEmail(u.email);
      const userPhone = this.normalizePhone(u.phone_number);
      return isEmail
        ? userEmail === normalizedInputEmail
        : userPhone && userPhone === normalizedInputPhone;
    });

    if (!user) return throwError(() => new Error('not_registered'));
    if (user.password !== password)
      return throwError(() => new Error('wrong_password'));

    localStorage.setItem(this.CURRENT_KEY, JSON.stringify(user));
    return of(user);
  }

  /**
   * Lấy thông tin user hiện tại, luôn đọc lại file users.json
   * để cập nhật star / coin / membership mới nhất
   */
  getCurrentAccount(): Observable<User | null> {
    const storedUser =
      JSON.parse(localStorage.getItem(this.CURRENT_KEY) || '{}') || {};

    return this.http.get<User[]>('assets/data/users.json').pipe(
      map((users) => {
        // Tìm user tương ứng trong file JSON
        const updated = users.find(
          (u) => u.email === storedUser.email || u.user_id === storedUser.user_id
        );

        // Nếu tìm thấy thì cập nhật lại localStorage cho đồng bộ
        if (updated) {
          localStorage.setItem(this.CURRENT_KEY, JSON.stringify(updated));
        }

        return updated || null;
      }),
      catchError((err) => {
        console.error('Lỗi khi đọc users.json:', err);
        return of(null);
      })
    );
  }

  /** Đăng xuất */
  logout(): void {
    localStorage.removeItem(this.CURRENT_KEY);
  }
}
