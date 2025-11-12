import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() { }

  private getAllUsers(): User[] {
    const usersString = localStorage.getItem('USERS');
    return usersString ? JSON.parse(usersString) : [];
  }

  private normalizePhone(p?: string): string {
    if (!p) return '';
    return p.toString().replace(/[^\d+]/g, '');
  }

  private normalizeEmail(e?: string): string {
    return (e || '').toLowerCase().trim();
  }

  // register nhận partial payload, tự sinh user_id
  register(userPayload: Partial<User>): Observable<any> {
    const users = this.getAllUsers();

    const normalizedEmail = this.normalizeEmail(userPayload.email);
    const normalizedPhone = this.normalizePhone(userPayload.phone_number);

    const emailExists = users.some(u => this.normalizeEmail(u.email) === normalizedEmail && normalizedEmail !== '');
    const phoneExists = users.some(u => this.normalizePhone(u.phone_number) === normalizedPhone && normalizedPhone !== '');

    const errors: any = {};
    if (emailExists) errors.email = true;
    if (phoneExists) errors.phone_number = true;
    if (Object.keys(errors).length) {
      return throwError(() => ({ errors }));
    }

    // tạo user_id dạng string để tương thích với dữ liệu hiện có
    const newId = 'US' + Date.now();
    const newUser: User = {
      user_id: String(newId),
      email: userPayload.email || '',
      phone_number: userPayload.phone_number || '',
      full_name: userPayload.full_name || '',
      gender: (userPayload.gender as any) || '',
      birthdate: userPayload.birthdate || '',
      city: userPayload.city || '',
      coin: 0,
      star: 0,
      password: userPayload.password || '',
      two_factor_enabled: false,
      account_status: 'active'
    };

    users.push(newUser);
    localStorage.setItem('USERS', JSON.stringify(users));

    return of({ success: true, user: newUser });
  }

  getAllUsersPublic(): User[] {
    return this.getAllUsers();
  }

  updateUserInfo(updatedUser: Partial<User>): Observable<any> {
    const currentUserString = localStorage.getItem('CURRENT_USER');
    if (!currentUserString) return throwError(() => new Error('not_logged_in'));

    const currentUser = JSON.parse(currentUserString) as User;
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.user_id === currentUser.user_id);
    if (idx === -1) return throwError(() => new Error('not_found'));

    users[idx] = { ...users[idx], ...updatedUser };
    localStorage.setItem('USERS', JSON.stringify(users));
    localStorage.setItem('CURRENT_USER', JSON.stringify(users[idx]));
    return of({ success: true, user: users[idx] });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const currentUserString = localStorage.getItem('CURRENT_USER');
    if (!currentUserString) return throwError(() => new Error('Chưa đăng nhập'));

    const currentUser = JSON.parse(currentUserString);
    const users = this.getAllUsers();

    const userIndex = users.findIndex(u => u.user_id === currentUser.user_id);
    if (userIndex === -1) return throwError(() => new Error('Không tìm thấy tài khoản'));

    if (users[userIndex].password !== currentPassword) {
      return throwError(() => new Error('Mật khẩu hiện tại không đúng'));
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('USERS', JSON.stringify(users));
    localStorage.setItem('CURRENT_USER', JSON.stringify(users[userIndex]));

    return of({ success: true });
  }

  updateTwoFactor(enabled: boolean): Observable<any> {
    const currentUserString = localStorage.getItem('CURRENT_USER');
    if (!currentUserString) return throwError(() => new Error('Chưa đăng nhập'));

    const currentUser = JSON.parse(currentUserString);
    const users = this.getAllUsers();

    const userIndex = users.findIndex(u => u.user_id === currentUser.user_id);
    if (userIndex === -1) return throwError(() => new Error('Không tìm thấy tài khoản'));

    users[userIndex].two_factor_enabled = enabled;
    localStorage.setItem('USERS', JSON.stringify(users));
    localStorage.setItem('CURRENT_USER', JSON.stringify(users[userIndex]));

    return of({ success: true, twoFactorEnabled: enabled });
  }

  deleteAccount(): Observable<any> {
    const currentUserString = localStorage.getItem('CURRENT_USER');
    if (!currentUserString) return throwError(() => new Error('Chưa đăng nhập'));

    const currentUser = JSON.parse(currentUserString);
    let users = this.getAllUsers();

    users = users.filter(u => u.user_id !== currentUser.user_id);
    localStorage.setItem('USERS', JSON.stringify(users));
    localStorage.removeItem('CURRENT_USER');

    return of({ success: true });
  }

