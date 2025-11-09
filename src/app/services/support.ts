import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { CreateTicketDto, FAQ, Ticket } from '../models/support';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly faqsUrl = 'assets/data/support-faqs.json';
  private readonly ticketsUrl = 'assets/data/support-tickets.json';

  private ticketsLoaded = false;
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);

  constructor(private http: HttpClient) {}

  getFaqs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.faqsUrl);
  }

  getTickets(): Observable<Ticket[]> {
    if (this.ticketsLoaded) return this.ticketsSubject.asObservable();
    return this.http.get<Ticket[]>(this.ticketsUrl).pipe(
      tap((tickets) => {
        this.ticketsSubject.next(tickets);
        this.ticketsLoaded = true;
      }),
      switchMap(() => this.ticketsSubject.asObservable())
    );
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    const newTicket: Ticket = {
      id: `T-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),
      name: dto.name,
      email: dto.email,
      category: dto.category,
      subject: dto.subject,
      message: dto.message,
      attachmentUrl: dto.attachmentUrl,
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    return of(newTicket).pipe(
      delay(800),
      tap((t) => this.ticketsSubject.next([t, ...this.ticketsSubject.getValue()]))
    );
  }
}