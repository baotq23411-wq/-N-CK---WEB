import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UserToolbarComponent } from './user-toolbar/user-toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, UserToolbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('panacea');
}
