<<<<<<< Updated upstream
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
import { BlogListPage } from './blog-list-page/blog-list-page';
import { Star } from './star/star';
import { Coin } from './coin/coin';
import { Policy } from './policy/policy';
import { AboutUsComponent } from './about-us/about-us';
import { TermsComponent } from './terms/terms';
import { Exchange } from './exchange/exchange';
import { ExchangeLanding } from './exchange-landing/exchange-landing';
import { SupportPageComponent } from './support-page/support-page';
import { ReviewRoom } from './review-room/review-room';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { AdminUsers } from './admin-users/admin-users';
import { AdminBookings } from './admin-bookings/admin-bookings';
import { AdminRooms } from './admin-rooms/admin-rooms';
import { AdminServices } from './admin-services/admin-services';
import { AdminExchange } from './admin-exchange/admin-exchange';
import { AdminReviews } from './admin-reviews/admin-reviews';
import { adminGuard } from './guards/admin.guard';
import { CustomerBookingComponent } from './customer-booking/customer-booking';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./homepage').then(m => m.Homepage) 
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'room-list', component: RoomList },
  { path: 'room-detail/:id', component: RoomDetail },
  { path: 'blog', component: BlogListPage },
  { path: 'payment', component: Payment },
  { path: 'banking', component: Banking },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'star', component: Star },
  { path: 'coin', component: Coin },
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
  { path: 'customer-booking', component: CustomerBookingComponent },
  { path: 'exchange', component: Exchange },
  { path: 'exchange-landing', component: ExchangeLanding },
  { path: 'support-page', component: SupportPageComponent },
  { path: 'review-room', component: ReviewRoom },
  { path: 'policy', component: Policy },
  { path: 'about', component: AboutUsComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [adminGuard] },
  { path: 'admin-users', component: AdminUsers, canActivate: [adminGuard] },
  { path: 'admin-bookings', component: AdminBookings, canActivate: [adminGuard] },
  { path: 'admin-rooms', component: AdminRooms, canActivate: [adminGuard] },
  { path: 'admin-services', component: AdminServices, canActivate: [adminGuard] },
  { path: 'admin-exchange', component: AdminExchange, canActivate: [adminGuard] },
  { path: 'admin-reviews', component: AdminReviews, canActivate: [adminGuard] },
  { path: '**', redirectTo: '/' },
=======
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
import { ReviewRoom } from './review-room/review-room';
import { SupportPageComponent } from './support-page/support-page';
import { BlogList } from './blog-list/blog-list';

export const routes: Routes = [
  // 👉 Vào thẳng support page khi mở app
  { path: '', redirectTo: 'review-room', pathMatch: 'full' },

  // Giữ route support & blog để có thể chuyển qua lại
  { path: 'review-room', component: ReviewRoom},

>>>>>>> Stashed changes
];

