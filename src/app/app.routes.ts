<<<<<<< Updated upstream
import { Routes } from '@angular/router';

export const routes: Routes = [];
=======
// import { Routes } from '@angular/router';
// import { RegisterPageComponent } from './register-page/register-page';
// import { LoginPageComponent } from './login-page/login-page';

// export const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   { path: 'login', component: LoginPageComponent },
//   { path: 'register', component: RegisterPageComponent }
// ];
import { Routes } from "@angular/router";
import { SupportPageComponent } from "./support-page/support-page";
export const routes: Routes = [
  // Route mặc định -> tự động chuyển đến /support
  { path: '', redirectTo: 'support', pathMatch: 'full' },

  // Trang hỗ trợ
  { path: 'support', component: SupportPageComponent },

  // Bắt tất cả route không tồn tại
  { path: '**', redirectTo: 'support' }
];
>>>>>>> Stashed changes
