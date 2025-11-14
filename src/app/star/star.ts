import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SEOService } from '../services/seo.service';

@Component({
  selector: 'app-star',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star implements OnInit {
  constructor(
    private seoService: SEOService
  ) {
    this.initializeAccordion();
  }

  ngOnInit(): void {
    this.seoService.updateSEO({
      title: 'Panacea Priority - Hệ Thống Hạng Thành Viên',
      description: 'Tìm hiểu về hệ thống Panacea Priority - Tích điểm, lên hạng và nhận các đặc quyền độc quyền từ Bronze đến Diamond.',
      keywords: 'Panacea Priority, hạng thành viên Panacea, Bronze Silver Gold Diamond, đặc quyền Panacea',
      image: '/assets/images/BACKGROUND.webp'
    });
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


