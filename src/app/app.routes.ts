// import { Routes } from '@angular/router';
// import { RegisterPageComponent } from './register-page/register-page';
// import { LoginPageComponent } from './login-page/login-page';
// import { SupportPageComponent } from './support-page/support-page';

// export const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   { path: 'login', component: LoginPageComponent },
//   { path: 'register', component: RegisterPageComponent }
// ];

import { Routes } from '@angular/router';
import { RoomList } from './room-list/room-list';
import { RoomDetail } from './room-detail/room-detail';
import { Payment } from './payment/payment';
import { Banking } from './banking/banking';
import { BlogListPage } from './blog-list-page/blog-list-page';
import { RegisterPageComponent } from './register-page/register-page';
import { LoginPageComponent } from './login-page/login-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'room-list', component: RoomList },
  { path: 'room-detail/:id', component: RoomDetail },
  { path: 'blog', component: BlogListPage },
  { path: 'payment', component: Payment },
  { path: 'banking', component: Banking },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent }
];

