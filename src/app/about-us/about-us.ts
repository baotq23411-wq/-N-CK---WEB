import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SEOService } from '../services/seo.service';

type Stat = { label: string; value: string; note?: string };
type ValueItem = { icon: string; title: string; desc: string };
type TimelineItem = { year: string; title: string; desc: string };

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.html',
  styleUrls: ['./about-us.css']
})
export class AboutUsComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly year = new Date().getFullYear();
  private observer?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;
  private statsAnimated = false;

  stats: Stat[] = [
    { value: '2,000+', label: 'Khách đã trải nghiệm', note: 'trong năm 2024' },
    { value: '500+',  label: 'Đánh giá 5★',           note: 'từ cộng đồng' },
    { value: '30+',   label: 'Hoạt động trị liệu',     note: 'đa dạng & an toàn' },
    { value: '10+',   label: 'Đối tác chuyên gia',     note: 'tâm lý & thiền' },
  ];

  // Giá trị số thực tế để đếm
  statNumbers: number[] = [2000, 500, 30, 10];
  // Giá trị hiện tại đang đếm
  currentStatValues: number[] = [0, 0, 0, 0];

  values: ValueItem[] = [
    { icon: 'bi-heart-pulse',  title: 'Chữa lành vững bền',    desc: 'Tập trung liệu pháp an toàn, theo dõi tiến trình cá nhân.' },
    { icon: 'bi-stars',        title: 'Trải nghiệm giàu cảm xúc', desc: 'Không gian thư giãn, hoạt động đa giác quan có chủ đích.' },
    { icon: 'bi-shield-check', title: 'Bảo mật & tôn trọng',   desc: 'Tôn trọng quyền riêng tư và đa dạng sắc thái cảm xúc.' },
  ];

  timeline: TimelineItem[] = [
    { year: '2022', title: 'Khởi nguồn ý tưởng',   desc: 'Cân bằng giữa giải trí và chữa lành.' },
    { year: '2023', title: 'Mở rộng hoạt động',    desc: 'Thử nghiệm các hoạt động mindful, nhận phản hồi tích cực.' },
    { year: '2024', title: 'Chuẩn hoá trải nghiệm',desc: 'Đo lường hiệu quả cho từng nhóm khách.' },
    { year: '2025', title: 'Hệ sinh thái Panacea', desc: 'Kết nối chuyên gia & cộng đồng, dịch vụ cá nhân hoá.' },
  ];

  partners = ['MoMo','ACB','HSBC','Vietcombank','MB','Citibank','VietinBank','TPBank','BIDV'];

  team = [
    { name: 'Member 01', role: 'Founder / Facilitator', avatar: 'assets/images/SUBLOGO.webp' },
    { name: 'Member 02', role: 'Experience Designer', avatar: 'assets/images/SUBLOGO.webp' },
    { name: 'Member 03', role: 'Therapy Coordinator', avatar: 'assets/images/SUBLOGO.webp' },
    { name: 'Member 04', role: 'Community Lead', avatar: 'assets/images/SUBLOGO.webp' },
  ];

  constructor(
    private elementRef: ElementRef,
    private seoService: SEOService
  ) {}

  ngOnInit() {
    // SEO
    this.seoService.updateSEO({
      title: 'Về Chúng Tôi - Panacea',
      description: 'Tìm hiểu về Panacea - Nơi chữa lành tâm hồn dành cho bạn. Sứ mệnh, giá trị cốt lõi, câu chuyện và đội ngũ của chúng tôi.',
      keywords: 'Về Panacea, giới thiệu Panacea, sứ mệnh Panacea, đội ngũ Panacea, câu chuyện Panacea',
      image: '/assets/images/BACKGROUND.webp'
    });

    // Khởi tạo Intersection Observer cho lazy load
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Ngừng quan sát sau khi đã hiển thị
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Kích hoạt khi 10% phần tử hiển thị
        rootMargin: '0px 0px -50px 0px' // Kích hoạt sớm hơn một chút
      }
    );

    // Khởi tạo Intersection Observer riêng cho stats section
    this.statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true;
            this.animateStats();
            this.statsObserver?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3, // Kích hoạt khi 30% stats section hiển thị
        rootMargin: '0px'
      }
    );
  }

  ngAfterViewInit() {
    // Quan sát tất cả các section và phần tử cần lazy load
    const sections = this.elementRef.nativeElement.querySelectorAll('section');
    sections.forEach((section: HTMLElement) => {
      this.observer?.observe(section);
    });

    // Quan sát các phần tử con trong sections
    const lazyElements = this.elementRef.nativeElement.querySelectorAll('.lazy-load');
    lazyElements.forEach((element: HTMLElement) => {
      this.observer?.observe(element);
    });

    // Quan sát stats section để kích hoạt đếm số
    const statsSection = this.elementRef.nativeElement.querySelector('.stats');
    if (statsSection) {
      this.statsObserver?.observe(statsSection);
    }

    // Hiển thị hero section ngay lập tức
    const heroSection = this.elementRef.nativeElement.querySelector('.hero');
    if (heroSection) {
      heroSection.classList.add('visible');
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.statsObserver) {
      this.statsObserver.disconnect();
    }
  }

  // Hàm easing để animation mượt mà hơn (easeOutQuart - mượt hơn easeOutCubic)
  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }

  // Hàm đếm số từ 0 đến giá trị cuối
  animateStats() {
    const duration = 1800; // 1.8 giây - nhanh hơn một chút
    const startTime = performance.now(); // Sử dụng performance.now() thay vì Date.now() để chính xác hơn

    const animate = () => {
      const elapsed = performance.now() - startTime;
      let progress = elapsed / duration;
      
      // Đảm bảo progress không vượt quá 1
      if (progress >= 1) {
        progress = 1;
        // Set giá trị cuối cùng ngay lập tức khi hoàn thành
        this.stats.forEach((stat, index) => {
          this.currentStatValues[index] = this.statNumbers[index];
        });
        return; // Dừng animation
      }
      
      // Sử dụng easing để đếm nhanh ở đầu, chậm lại ở cuối (nhưng mượt hơn)
      const easedProgress = this.easeOutQuart(progress);
      
      // Cập nhật tất cả các số cùng lúc
      this.stats.forEach((stat, index) => {
        const targetValue = this.statNumbers[index];
        // Sử dụng Math.round thay vì Math.floor để mượt hơn ở cuối
        const currentValue = Math.round(targetValue * easedProgress);
        // Đảm bảo không vượt quá giá trị đích
        this.currentStatValues[index] = Math.min(currentValue, targetValue);
      });

      // Tiếp tục animation
      requestAnimationFrame(animate);
    };

    // Bắt đầu animation ngay lập tức
    requestAnimationFrame(animate);
  }

  // Hàm format số để hiển thị (thêm dấu phẩy và dấu +)
  formatStatValue(index: number): string {
    const value = this.currentStatValues[index];
    const formatted = value.toLocaleString('vi-VN');
    return formatted + '+';
  }
}
