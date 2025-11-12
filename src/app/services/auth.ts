import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** LocalStorage key constants */
  private readonly USERS_KEY = 'USERS';
  private readonly CURRENT_KEY = 'CURRENT_USER';

  /** Dòng trạng thái login & user hiện tại (giống BehaviorSubject bên bản mock) */
  private authState$ = new BehaviorSubject<boolean>(this.hasCurrentUser());
  private currentUser$ = new BehaviorSubject<User | null>(this.loadCurrentFromLS());

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

  /** ===== PUBLIC API ===== */

  /** Observable theo dõi login/logout */
  authChanges(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  /** Đã đăng nhập chưa (giá trị tức thời) */
  isLoggedIn(): boolean {
    return this.authState$.value;
  }

  /** Lấy user hiện tại (Observable) */
  getCurrentAccount(): Observable<User | null> {
    const storedUser =
      JSON.parse(localStorage.getItem(this.CURRENT_KEY) || '{}') || {};

    return this.http.get<User[]>('assets/data/users.json').pipe(
      map((users) => {
        const updated = users.find(
          (u) => u.email === storedUser.email || u.user_id === storedUser.user_id
        );

        if (updated) {
          localStorage.setItem(this.CURRENT_KEY, JSON.stringify(updated));
          this.currentUser$.next(updated);
          this.authState$.next(true);
        }

        return updated || null;
      }),
      catchError((err) => {
        console.error('Lỗi khi đọc users.json:', err);
        return of(this.currentUser$.value || null);
      })
    );
  }

  /** Lấy user hiện tại tức thời */
  getCurrentAccountOnce(): User | null {
    return this.currentUser$.value;
  }

  /** ID người dùng hiện tại */
  getCurrentUserId(): string | null {
    const user = this.currentUser$.value;
    return user ? user.user_id : null;
  }

  /** Đăng nhập thật (dựa vào users.json) */
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
    this.currentUser$.next(user);
    this.authState$.next(true);
    return of(user);
  }

  /** Đăng xuất */
  logout(): void {
    localStorage.removeItem(this.CURRENT_KEY);
    this.currentUser$.next(null);
    this.authState$.next(false);
  }

  /** ===== Helpers ===== */

  private hasCurrentUser(): boolean {
    return !!localStorage.getItem(this.CURRENT_KEY);
  }

  private loadCurrentFromLS(): User | null {
    const raw = localStorage.getItem(this.CURRENT_KEY);
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  /** Cập nhật điểm (tuỳ chọn cho loyalty) */
  updatePoints(delta: number): void {
    const user = this.getCurrentAccountOnce();
    if (!user) return;
    const updated = {
      ...user,
      diem_kha_dung: Math.max(0, (user as any).diem_kha_dung + delta),
    } as User;
    localStorage.setItem(this.CURRENT_KEY, JSON.stringify(updated));
    this.currentUser$.next(updated);
  }
}
