import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page';
import { LoginPageComponent } from './login-page/login-page';
import { Exchange } from './exchange/exchange';
import { Banking } from './banking/banking';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'exchange', component: Exchange },
  { path: 'banking', component: Banking }
];
