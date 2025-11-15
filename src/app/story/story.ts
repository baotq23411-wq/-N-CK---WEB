import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SEOService } from '../services/seo.service';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './story.html',
  styleUrls: ['./story.css']
})
export class StoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private seoService: SEOService) {}

  ngOnInit() {
    // SEO
    this.seoService.updateSEO({
      title: 'Cốt truyện - Panacea',
      description: 'Cốt truyện về hành trình của Linh qua vũ trụ Panacea - nơi những giấc mơ bị lãng quên khẽ gọi tên. Khám phá 4 hành tinh: Catharis, Genii, Oasis và Mutiny.',
      keywords: 'Cốt truyện Panacea, hành trình Linh, Catharis, Genii, Oasis, Mutiny, chữa lành tâm hồn',
      image: '/assets/images/Panacea1.webp'
    });
  }

  ngAfterViewInit() {
    // Tạo Intersection Observer để detect khi các strong tags vào viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.3, // Trigger khi 30% phần tử vào viewport
      rootMargin: '0px 0px -50px 0px' // Trigger sớm hơn một chút
    });

    // Observe tất cả các strong tags
    setTimeout(() => {
      const strongElements = document.querySelectorAll('.intro-panel-text strong, .intro-description-text strong, .planet-description strong, .reality-text strong');
      strongElements.forEach(el => {
        this.observer?.observe(el);
      });
    }, 100);

  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}