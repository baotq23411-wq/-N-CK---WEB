import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersUrl = 'assets/data/users.json';

  constructor(private http: HttpClient) { }

  login(credentials: { emailOrPhone: string; password: string }): Observable<any> {
    return this.http.get<User[]>(this.usersUrl).pipe(
      map((users: User[]) => {
        const user = users.find(
          (u) =>
            (u.email === credentials.emailOrPhone || u.phone_number === credentials.emailOrPhone) &&
            u.password === credentials.password
        );
        if (user) {
          localStorage.setItem('UID', user.id.toString());
          return { user };
        } else {
          // Kiểm tra nếu email/sđt tồn tại nhưng sai mật khẩu
          const exist = users.find(
            (u) =>
              u.email === credentials.emailOrPhone || u.phone_number === credentials.emailOrPhone
          );
          if (exist) {
            throw { message: 'Sai mật khẩu' };
          } else {
            throw { message: 'Email/Số điện thoại chưa đăng ký' };
          }
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('UID');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('UID');
  }

  getCurrentUser(): number | null {
    const uid = localStorage.getItem('UID');
    return uid ? parseInt(uid) : null;
  }
}
