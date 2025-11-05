import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface Account {
  id: number;
  ho_ten: string;
  email: string;
  diem_tich_luy: number;   // dùng để tính hạng
  diem_kha_dung: number;   // điểm hiện có
}

const LS_TOKEN_KEY = 'panacea_token';
const LS_ACC_KEY   = 'panacea_account';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor() {
    // demo: nếu chưa có account thì seed sẵn
    if (!localStorage.getItem(LS_ACC_KEY)) {
      const demo: Account = {
        id: 1,
        ho_ten: 'User Demo',
        email: 'demo@panacea.vn',
        diem_tich_luy: 120000,
        diem_kha_dung: 450
      };
      localStorage.setItem(LS_ACC_KEY, JSON.stringify(demo));
    }
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  getCurrentAccount(): Observable<Account | null> {
    const raw = localStorage.getItem(LS_ACC_KEY);
    return of(raw ? JSON.parse(raw) as Account : null);
  }

  // demo login (sau này thay bằng API thật)
  login(email: string, password: string): Observable<boolean> {
    localStorage.setItem(LS_TOKEN_KEY, 'demo_token');
    this.loggedIn$.next(true);
    return of(true);
  }

  logout(): void {
    localStorage.removeItem(LS_TOKEN_KEY);
    this.loggedIn$.next(false);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(LS_TOKEN_KEY);
  }
}
