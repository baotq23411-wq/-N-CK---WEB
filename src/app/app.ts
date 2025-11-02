import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BlogList } from './blog-list/blog-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BlogList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('panacea');
}
