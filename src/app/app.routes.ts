import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page';
import { LoginPageComponent } from './login-page/login-page';

export const routes: Routes = [
  { path: '', redirectTo: 'room-list', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent }
];
