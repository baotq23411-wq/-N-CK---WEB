import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star {
   constructor() {
    this.initializeAccordion();
  }
  isPopupOpen = false;

  openPopup(): void {
    this.isPopupOpen = true;
  }

  closePopup(): void {
    this.isPopupOpen = false;
  }

  private initializeAccordion() {
    document.addEventListener('DOMContentLoaded', () => {
      // Accordion logic: mở nhiều mục, bấm lại để đóng
      const headers = document.querySelectorAll<HTMLButtonElement>('.accordion-header');
      headers.forEach(header => {
        header.addEventListener('click', () => {
          const item = header.parentElement as HTMLElement;
          item.classList.toggle('active');
        });
      });

      // Tabs logic: chuyển đổi giữa các tab
      const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');
      const panels = document.querySelectorAll<HTMLElement>('.tab-panel');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          panels.forEach(panel => {
            panel.classList.toggle('hidden', panel.id !== tab.dataset['tab']);
          });
        });
      });
    });
  }

}


