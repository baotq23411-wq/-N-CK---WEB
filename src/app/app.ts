import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SupportPageComponent } from "./support-page/support-page";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, SupportPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('panacea');
}