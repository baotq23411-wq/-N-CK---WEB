import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { RoomList } from './room-list/room-list';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
// removed duplicate RouterOutlet import (kept RouterOutlet above)

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('panacea');
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // 🟩 ADDED: Scroll to top khi navigate đến trang mới
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0); // Scroll về đầu trang
      });
  }

  ngOnDestroy(): void {
    // 🟩 ADDED: Cleanup subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
