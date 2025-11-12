import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],               // để dùng *ngIf, ngClass...
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  showBackTop = false;
  year = new Date().getFullYear();

  @HostListener('window:scroll')
  onScroll() {
    this.showBackTop = window.scrollY > 280;
  }

  backToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
