import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, throwError } from 'rxjs';

/** Kiểu dữ liệu tài khoản dùng trong app */
export interface Account {
  id: number;
  ho_ten: string;
  email: string;
  phone_number?: string;
  diem_tich_luy: number;   // dùng tính hạng
  diem_kha_dung: number;   // điểm hiện có
}

/** LocalStorage keys */
const LS_TOKEN_KEY = 'panacea_token';
const LS_ACC_KEY   = 'panacea_account';
const LS_UID_KEY   = 'UID';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Mock data: đọc từ assets (có thể thay bằng API sau này) */
  private usersUrl = 'assets/data/users.json';

  /** Trạng thái đăng nhập & tài khoản hiện tại (quan sát được) */
  private authState$ = new BehaviorSubject<boolean>(this.hasToken());
  private account$   = new BehaviorSubject<Account | null>(AuthService.loadAccountFromStorage());

  constructor(private http: HttpClient) {
    // seed demo account nếu chưa có (giúp giao diện chạy ngay)
    if (!localStorage.getItem(LS_ACC_KEY)) {
      const demo: Account = {
        id: 1,
        ho_ten: 'User Demo',
        email: 'demo@panacea.vn',
        phone_number: '0900000000',
        diem_tich_luy: 120000,
        diem_kha_dung: 450
      };
      localStorage.setItem(LS_ACC_KEY, JSON.stringify(demo));
      this.account$.next(demo);
    }
  }

  /** ==== PUBLIC API (Header đang dùng) ==== */

  /** Observable theo dõi login/logout */
  authChanges(): Observable<boolean> { return this.authState$.asObservable(); }

  /** Đã đăng nhập chưa (giá trị tức thời) */
  isLoggedIn(): boolean { return this.authState$.value; }

  /** Lấy account hiện tại (observable) */
  getCurrentAccount(): Observable<Account | null> { return this.account$.asObservable(); }

  /** Lấy account tức thời (không cần subscribe) */
  getCurrentAccountOnce(): Account | null { return this.account$.value; }

  /** ID người dùng hiện tại (nếu có) */
  getCurrentUserId(): number | null {
    const id = localStorage.getItem(LS_UID_KEY);
    return id ? Number(id) : null;
  }

  /**
   * Login mock:
   * - Đọc users.json (mỗi user có {id,email,phone_number,password,...})
   * - Cho phép đăng nhập bằng email hoặc số điện thoại
   * - Lưu token giả + account vào localStorage
   */
  login(credentials: { emailOrPhone: string; password: string }): Observable<Account> {
    const { emailOrPhone, password } = credentials;

    return this.http.get<Array<Account & { password?: string }>>(this.usersUrl).pipe(
      map(users => {
        const user = users.find(
          u =>
            (u.email === emailOrPhone || u.phone_number === emailOrPhone) &&
            (u as any).password === password
        );

        if (!user) {
          const exist = users.find(
            u => u.email === emailOrPhone || u.phone_number === emailOrPhone
          );
          throw exist
            ? { message: 'Sai mật khẩu' }
            : { message: 'Email/Số điện thoại chưa đăng ký' };
        }

        // Chuẩn hoá account lưu trữ (không giữ password)
        const account: Account = {
          id: user.id,
          ho_ten: user.ho_ten,
          email: user.email,
          phone_number: user.phone_number,
          diem_tich_luy: user.diem_tich_luy ?? 0,
          diem_kha_dung: user.diem_kha_dung ?? 0
        };

        // Persist
        localStorage.setItem(LS_UID_KEY, String(account.id));
        localStorage.setItem(LS_TOKEN_KEY, 'mock_token');
        localStorage.setItem(LS_ACC_KEY, JSON.stringify(account));

        // Broadcast
        this.account$.next(account);
        this.authState$.next(true);

        return account;
      })
    );
  }

  /** Đăng xuất: xoá token + không đụng dữ liệu account demo (tuỳ bạn) */
  logout(): void {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_UID_KEY);
    this.authState$.next(false);

    // Nếu muốn xoá luôn account khỏi storage, bật 2 dòng dưới:
    // localStorage.removeItem(LS_ACC_KEY);
    // this.account$.next(null);
  }

  /** ==== Helpers ==== */

  private hasToken(): boolean {
    return !!localStorage.getItem(LS_TOKEN_KEY);
  }

  private static loadAccountFromStorage(): Account | null {
    const raw = localStorage.getItem(LS_ACC_KEY);
    try { return raw ? (JSON.parse(raw) as Account) : null; }
    catch { return null; }
  }

  /** (Tuỳ chọn) cập nhật điểm – cho phần Loyalty sau này */
  updatePoints(delta: number): void {
    const acc = this.getCurrentAccountOnce();
    if (!acc) return;
    const updated = { ...acc, diem_kha_dung: Math.max(0, acc.diem_kha_dung + delta) };
    localStorage.setItem(LS_ACC_KEY, JSON.stringify(updated));
    this.account$.next(updated);
  }
}
