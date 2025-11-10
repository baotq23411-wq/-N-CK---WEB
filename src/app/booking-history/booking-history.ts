import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserToolbarComponent } from '../user-toolbar/user-toolbar';

@Component({
  selector: 'app-booking-history',
  imports: [CommonModule, FormsModule, UserToolbarComponent],
  templateUrl: './booking-history.html',
  styleUrl: './booking-history.css',
})
export class BookingHistoryComponent {

}
