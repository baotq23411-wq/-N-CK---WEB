import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page';
import { CustomerAccountComponent } from './customer-account/customer-account';
import { AccountInformationComponent } from './account-information/account-information';
import { PasswordSecurityComponent } from './password-security/password-security';
import { CustomerCoinComponent } from './customer-coin/customer-coin';
import { CustomerStarComponent } from './customer-star/customer-star';
import { BookingHistoryComponent } from './booking-history/booking-history';
import { LoginPageComponent } from './login-page/login-page';
import { RoomList } from './room-list/room-list';
import { RoomDetail } from './room-detail/room-detail';
import { Payment } from './payment/payment';
import { Banking } from './banking/banking';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: '', redirectTo: 'room-list', pathMatch: 'full' },
  { path: 'room-list', component: RoomList },
  { path: 'room-detail/:id', component: RoomDetail },
  { path: 'payment', component: Payment },
  { path: 'banking', component: Banking },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  {
    path: 'customer-account',
    component: CustomerAccountComponent,
    children: [
      { path: 'account-information', component: AccountInformationComponent },
      { path: 'password-security', component: PasswordSecurityComponent },
      { path: '', redirectTo: 'account-information', pathMatch: 'full' },
    ],
  },
  { path: 'customer-coin', component: CustomerCoinComponent },
  { path: 'customer-star', component: CustomerStarComponent },
  { path: 'booking-history', component: BookingHistoryComponent },

  { path: '**', redirectTo: '/login' },
];
