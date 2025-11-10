import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page';
import { RegisterPageComponent } from './register-page/register-page';
import { CustomerAccountComponent } from './customer-account/customer-account';
import { AccountInformationComponent } from './account-information/account-information';
import { PasswordSecurityComponent } from './password-security/password-security';
import { CustomerCoinComponent } from './customer-coin/customer-coin';
import { CustomerStarComponent } from './customer-star/customer-star';
import { BookingHistoryComponent } from './booking-history/booking-history';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
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
