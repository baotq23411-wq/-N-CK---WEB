import { Routes } from '@angular/router';
import { RegisterPageComponent } from './register-page/register-page';
import { LoginPageComponent } from './login-page/login-page';
import { RoomDetail } from './room-detail/room-detail';
import { RoomList } from './room-list/room-list';

export const routes: Routes = [
  { path: '', redirectTo: 'room-list', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'room-list', component: RoomList },
  { path: 'room-detail/:id', component: RoomDetail }
];
