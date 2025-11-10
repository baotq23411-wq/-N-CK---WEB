import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: number;
  roomId: number;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private url = 'assets/data/reviews.json';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.url);
  }
}
