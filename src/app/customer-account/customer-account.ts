import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserToolbarComponent } from '../user-toolbar/user-toolbar';

@Component({
  selector: 'app-customer-account',
  standalone: true,
  imports: [RouterModule, CommonModule, UserToolbarComponent],
  templateUrl: './customer-account.html',
  styleUrls: ['./customer-account.css']
})
export class CustomerAccountComponent implements OnInit {
  activeTab: string = 'account';

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.updateActiveTab(this.router.url);
    this.router.events.subscribe((event: any) => {
      if (event.url) {
        this.updateActiveTab(event.url);
      }
    });
  }

  updateActiveTab(url: string): void {
    if (url.includes('account-information')) {
      this.activeTab = 'account';
    } else if (url.includes('password-security')) {
      this.activeTab = 'security';
    } else if (url.includes('customer-coin')) {
      this.activeTab = 'coin';
    } else if (url.includes('customer-star')) {
      this.activeTab = 'star';
    } else if (url.includes('booking-history')) {
      this.activeTab = 'history';
    } else {
      this.activeTab = '';
    }
  }
}
