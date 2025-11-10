import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page';
import { LoginPageComponent } from './login-page/login-page';
import { SupportPageComponent } from './support-page/support-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent }
];

// import { Routes } from '@angular/router';
// import { ReviewRoom } from './review-room/review-room';
// import { SupportPageComponent } from './support-page/support-page';

// export const routes: Routes = [
//   // 👉 Vào thẳng support page khi mở app
//   { path: '', redirectTo: 'review-room', pathMatch: 'full' },

//   // Giữ route support & blog để có thể chuyển qua lại
//   { path: 'review-room', component: ReviewRoom},

// ];

