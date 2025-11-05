import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import BlogListPanacea from './blog-list/blog-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BlogListPanacea],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('panacea');
}
