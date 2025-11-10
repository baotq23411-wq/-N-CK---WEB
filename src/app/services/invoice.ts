import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private userUrl = 'assets/data/user.json';
  private roomUrl = 'assets/data/room.json';
  private servicesUrl = 'assets/data/services.json';
  private headerUrl = 'assets/data/header.json';

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get(this.userUrl);
  }

  getRoom(): Observable<any> {
    return this.http.get(this.roomUrl);
  }

  getHeader(): Observable<any> {
    return this.http.get(this.headerUrl);
  }

  getServices(): Observable<any> {
    return this.http.get(this.servicesUrl);
  }

  saveBooking(data: any): Observable<any> {
    console.log('Đã lưu đặt phòng:', data);
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next({ success: true });
        observer.complete();
      }, 800);
    });
  }
}
