import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page';
import { LoginPageComponent } from './login-page/login-page';
import { UserToolbarComponent } from './user-toolbar/user-toolbar';
import { AccPointComponent } from './account-point/account-point';
import { BookingHistory } from './booking-history/booking-history';
import { AccountInformation } from './account-information/account-information';
import { AccountEdit } from './account-edit/account-edit';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'user-toolbar', component: UserToolbarComponent },
  { path: 'account-point', component: AccPointComponent },
  { path: 'account-booking-history', component: BookingHistory },
  { path: 'account-information', component: AccountInformation },
  { path: 'account-edit', component: AccountEdit }

];
