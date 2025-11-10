import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RoomList } from './room-list/room-list';
import { FormsModule } from '@angular/forms';
import { RoomDetail } from './room-detail/room-detail';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RoomList, CommonModule, FormsModule, RoomDetail],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('panacea');
}
