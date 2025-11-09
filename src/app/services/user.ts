import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() { }

  register(user: User): Observable<any> {
    // Lấy danh sách user từ localStorage
    const usersString = localStorage.getItem('USERS');
    const users: User[] = usersString ? JSON.parse(usersString) : [];

    // Kiểm tra email hoặc số điện thoại đã tồn tại chưa
    const emailExists = users.some(u => u.email === user.email);
    const phoneExists = users.some(u => u.phone_number === user.phone_number);

    if (emailExists && phoneExists) {
      return throwError(() => ({ error: { errors: { email: true, phone_number: true } } }));
    }

    if (emailExists) {
      return throwError(() => ({
        errors: { email: true },
      }));
    }

    if (phoneExists) {
      return throwError(() => ({
        errors: { phone_number: true },
      }));
    }

    // Tạo id tự động
    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    const newUser: User = {
      ...user,
      id: newId,
      point: 0,
      star: 0,
      membership_type: 'Standard',
      role: 'user'
    };

    users.push(newUser);
    localStorage.setItem('USERS', JSON.stringify(users));

    return of({ user: newUser });
  }

  getAllUsers(): User[] {
    const usersString = localStorage.getItem('USERS');
    return usersString ? JSON.parse(usersString) : [];
  }
}
