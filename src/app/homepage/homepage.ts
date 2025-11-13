import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

type Garden = {
  key: 'an-nhien' | 'tam-hon' | 'cam-hung' | 'cach-mang';
  title: string;
  subtitle: string;
  desc: string;
  link: string;
  cover: string;
};

type Post = {
  title: string;
  excerpt: string;
  icon: 'an-nhien' | 'tam-hon' | 'cam-hung' | 'cach-mang';
  tag: string;
  date: string;
  link: string;
};

type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Khách mới' | string;

type Feedback = {
  name: string;
  tier?: Tier;
  role?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class Homepage implements AfterViewInit, OnDestroy {
  @ViewChild('heroVideo') heroVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('gardensSection') gardensSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('blogSection') blogSectionRef!: ElementRef<HTMLElement>;
  @ViewChild('prioritySection') prioritySectionRef!: ElementRef<HTMLElement>;
  @ViewChild('feedbackSection') feedbackSectionRef!: ElementRef<HTMLElement>;

  // Flags để track sections đã load
  gardensLoaded = false;
  blogLoaded = false;
  priorityLoaded = false;
  feedbackLoaded = false;

  private observer?: IntersectionObserver;
  private scrollRevealObserver?: IntersectionObserver;

  constructor(private router: Router) {
    console.log('Homepage component đã được khởi tạo!');
  }

  ngAfterViewInit() {
    // ✅ FIXED: Tối ưu video loading và đảm bảo muted
    if (this.heroVideoRef?.nativeElement) {
      const video = this.heroVideoRef.nativeElement;
      
      // Đảm bảo video luôn muted
      video.muted = true;
      video.volume = 0;
      
      // Tối ưu loading: load video ngay lập tức
      video.load();
      
      // Đảm bảo video tự động play khi component load
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Auto-play bị chặn, cần user interaction:', err);
        });
      }
      
      // Đảm bảo video luôn muted khi có sự kiện
      video.addEventListener('volumechange', () => {
        if (!video.muted) {
          video.muted = true;
          video.volume = 0;
        }
      });
    }

    // Setup Intersection Observer cho lazy loading sections
    this.setupIntersectionObserver();
    
    // Setup Intersection Observer cho scroll reveal animation
    setTimeout(() => {
      this.setupScrollReveal();
    }, 150);
  }

  ngOnDestroy() {
    // Cleanup observers
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.scrollRevealObserver) {
      this.scrollRevealObserver.disconnect();
    }
  }

  private setupIntersectionObserver() {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '200px', // Load trước 200px khi scroll đến để mượt hơn
      threshold: 0.01 // Trigger ngay khi 1% section vào viewport
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const sectionId = target.getAttribute('data-section');

          switch (sectionId) {
            case 'gardens':
              if (!this.gardensLoaded) {
                console.log('🌿 Gardens section đang load...');
                this.gardensLoaded = true;
                this.loadGardenImages();
              }
              break;
            case 'blog':
              if (!this.blogLoaded) {
                console.log('📚 Blog section đang load...');
                this.blogLoaded = true;
              }
              break;
            case 'priority':
              if (!this.priorityLoaded) {
                console.log('⭐ Priority section đang load...');
                this.priorityLoaded = true;
              }
              break;
            case 'feedback':
              if (!this.feedbackLoaded) {
                console.log('💬 Feedback section đang load...');
                this.feedbackLoaded = true;
              }
              break;
          }

          // Unobserve sau khi đã load
          this.observer?.unobserve(target);
        }
      });
    }, options);

    // Observe các sections - tạo sentinel elements thay vì observe sections trực tiếp
    setTimeout(() => {
      // Tạo sentinel cho gardens section
      this.createSentinel('gardens', this.gardensSectionRef);
      // Tạo sentinel cho blog section
      this.createSentinel('blog', this.blogSectionRef);
      // Tạo sentinel cho priority section
      this.createSentinel('priority', this.prioritySectionRef);
      // Tạo sentinel cho feedback section
      this.createSentinel('feedback', this.feedbackSectionRef);
    }, 100);
  }

  private createSentinel(sectionId: string, sectionRef: ElementRef<HTMLElement> | undefined) {
    if (!sectionRef?.nativeElement) return;

    // Observe section trực tiếp (đơn giản và hiệu quả hơn)
    this.observer?.observe(sectionRef.nativeElement);
  }

  private loadGardenImages() {
    // Preload garden images khi section vào viewport
    this.gardens.forEach(garden => {
      const img = new Image();
      img.src = garden.cover;
    });
  }

  private setupScrollReveal(): void {
    const options: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.scrollRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Unobserve sau khi đã animate để tối ưu performance
          this.scrollRevealObserver?.unobserve(entry.target);
        }
      });
    }, options);

    // Tìm tất cả các elements cần animate
    const elementsToReveal = document.querySelectorAll('.scroll-reveal');
    elementsToReveal.forEach(el => {
      this.scrollRevealObserver?.observe(el);
    });
  }

  // ========== HOME VIDEO ==========
  videoSrc = 'assets/video/panacea.mp4';
  videoPoster = 'assets/images/cover-home.webp';

  // ========== SEARCH BAR ==========
  activeTab: 'book' | 'guide' = 'book';
  isActive(tab: string) { return this.activeTab === tab as any; }
  setTab(tab: 'book' | 'guide') { this.activeTab = tab; }

  // Khu vườn - dùng checkbox như room-list
  gardenTags: string[] = ['Oasis', 'Catharis', 'Genii', 'Mutiny'];
  selectedGardens: string[] = [];
  
  zones = [
    { key: 'all', label: 'Tất cả', garden: '' },
    { key: 'an-nhien', label: 'An Nhiên', garden: 'Oasis' },
    { key: 'tam-hon', label: 'Tâm Hồn', garden: 'Catharis' },
    { key: 'cam-hung', label: 'Cảm Hứng', garden: 'Genii' },
    { key: 'cach-mang', label: 'Cách Mạng', garden: 'Mutiny' }
  ];
  
  servicesMap: Record<string, string[]> = {
    'an-nhien': ['Thiền định', 'Yoga Flow', 'Massage Thảo mộc'],
    'tam-hon': ['Tham vấn 1:1', 'Viết nhật ký có hướng dẫn'],
    'cam-hung': ['Workshop Vẽ', 'Phòng Âm nhạc'],
    'cach-mang': ['VR Game', 'Thử thách thể lực']
  };

  zone = 'all';
  service = '';
  date: string = '';
  time: string = '';
  promo: string = '';
  guestCountFilter: string = '';
  
  // Filter properties - đơn giản hóa
  minPrice: number = 200000;
  maxPrice: number = 1250000;
  selectedMinPrice: any = this.minPrice;
  selectedMaxPrice: any = this.maxPrice;
  
  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + ' VND';
  }
  
  resetPrice() {
    this.selectedMinPrice = this.minPrice.toLocaleString('vi-VN');
    this.selectedMaxPrice = this.maxPrice.toLocaleString('vi-VN');
  }
  
  onPriceInput(event: any, type: 'min' | 'max') {
    // Chỉ lưu số thô khi đang gõ, không format
    let value = event.target.value.replace(/\D/g, ''); // Chỉ giữ số
    
    // Giới hạn số tối đa là 9.999.999
    if (value) {
      const numValue = parseInt(value);
      if (numValue > 9999999) {
        value = '9999999';
      } else {
        value = numValue.toString();
      }
    }
    
    // Lưu số thô khi đang gõ (không format)
    if (type === 'min') {
      this.selectedMinPrice = value;
    } else {
      this.selectedMaxPrice = value;
    }
  }
  
  onPriceBlur(event: any, type: 'min' | 'max') {
    // Format với dấu chấm khi blur (rời khỏi input)
    let value = event.target.value.replace(/\D/g, '');
    
    if (value) {
      const numValue = parseInt(value);
      if (numValue > 9999999) {
        value = '9999999';
      }
      const formatted = numValue.toLocaleString('vi-VN');
      
      if (type === 'min') {
        this.selectedMinPrice = formatted;
      } else {
        this.selectedMaxPrice = formatted;
      }
    }
  }
  
  onPriceKeyDown(event: any, type: 'min' | 'max') {
    // Format khi nhấn Enter
    if (event.key === 'Enter') {
      event.preventDefault();
      let value = event.target.value.replace(/\D/g, '');
      
      if (value) {
        const numValue = parseInt(value);
        if (numValue > 9999999) {
          value = '9999999';
        }
        const formatted = numValue.toLocaleString('vi-VN');
        
        if (type === 'min') {
          this.selectedMinPrice = formatted;
        } else {
          this.selectedMaxPrice = formatted;
        }
      }
    }
  }
  
  getPriceValue(price: any): number {
    if (!price) return 0;
    const numStr = String(price).replace(/\./g, '');
    return parseInt(numStr) || 0;
  }
  
  getZoneButtonLabel(zone: any): string {
    if (zone.key === 'all') {
      return zone.label;
    }
    return `${zone.garden} - ${zone.label}`;
  }

  selectZone(zoneKey: string) {
    this.zone = zoneKey;
    if (zoneKey === 'all') {
      // Chọn tất cả gardens
      this.selectedGardens = [...this.gardenTags];
    } else {
      // Chọn garden tương ứng
      const zoneGarden = this.zones.find(z => z.key === zoneKey)?.garden;
      if (zoneGarden) {
        this.selectedGardens = [zoneGarden];
      }
    }
    // Reset service khi đổi zone
    if (zoneKey !== 'all') {
      const list = this.servicesMap[zoneKey] || [];
      this.service = list[0] ?? '';
    } else {
      this.service = '';
    }
  }

  toggleAllGardens(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.selectedGardens = [...this.gardenTags];
      this.zone = 'all';
    } else {
      this.selectedGardens = [];
      this.zone = 'all';
    }
  }
  
  isAllGardensSelected(): boolean {
    return this.selectedGardens.length === this.gardenTags.length;
  }

  onSearch() {
    // Chuyển đến trang room-list với query params
    const queryParams: any = {};
    
    // Truyền gardens filter
    if (this.selectedGardens.length > 0 && this.zone !== 'all') {
      queryParams.gardens = this.selectedGardens.join(',');
    }
    
    // Truyền guest count filter
    if (this.guestCountFilter) {
      queryParams.guests = this.guestCountFilter;
    }
    
    // Truyền price filter (chuyển từ format có dấu chấm về số)
    const minPriceValue = this.getPriceValue(this.selectedMinPrice);
    const maxPriceValue = this.getPriceValue(this.selectedMaxPrice);
    
    // Luôn truyền giá để room-list có thể set filter
    queryParams.minPrice = minPriceValue || this.minPrice;
    queryParams.maxPrice = maxPriceValue || this.maxPrice;
    
    // Navigate đến room-list với query params
    this.router.navigate(['/room-list'], { queryParams });
  }

  // ========== GARDENS ==========
  gardens: Garden[] = [
    {
      key: 'an-nhien',
      title: 'Oasis — An Nhiên',
      subtitle: 'Meditation & Mindfulness',
      desc: 'Không gian thiền tĩnh, yoga, thư giãn. Tìm về bình an nội tâm với các gói: Tĩnh Tâm (1-2 người), Chia Sẻ (3-5 người), Workshop Tĩnh (6-10 người).',
      link: '/room-list',
      cover: 'assets/images/tinh_tam.webp',
    },
    {
      key: 'tam-hon',
      title: 'Catharsis — Thư Giãn',
      subtitle: 'Yoga & Balance',
      desc: 'Không gian yoga, thiền, cân bằng năng lượng. Các gói: Thư Giãn (1-2 người), Cân Bằng (3-5 người), Đồng Điệu (6-10 người).',
      link: '/room-list',
      cover: 'assets/images/catharsis_room_1.webp',
    },
    {
      key: 'cam-hung',
      title: 'Genii — Cảm Hứng',
      subtitle: 'Creative Arts',
      desc: 'Không gian sáng tạo, nghệ thuật, workshop. Các gói: Sáng Tác (1-2 người), Nghệ Thuật (3-5 người), Workshop Sáng Tạo (6-10 người).',
      link: '/room-list',
      cover: 'assets/images/sang_tac.webp',
    },
    {
      key: 'cach-mang',
      title: 'Mutiny — Cách Mạng',
      subtitle: 'Gaming & Play',
      desc: 'Không gian gaming, VR, giải trí, xả stress. Các gói: Rage & Game (1-2 người), Chiến Hữu (3-5 người), Đại Náo (6-10 người).',
      link: '/room-list',
      cover: 'assets/images/rage.webp',
    },
  ];

  trackByKey = (_: number, g: Garden) => g.key;

  // Map key sang tên garden trong room-list
  getGardenName(key: string): string {
    const map: Record<string, string> = {
      'an-nhien': 'Oasis',
      'tam-hon': 'Catharis',
      'cam-hung': 'Genii',
      'cach-mang': 'Mutiny'
    };
    return map[key] || '';
  }

  goToRoomList(garden: Garden, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    const gardenName = this.getGardenName(garden.key);
    if (gardenName) {
      this.router.navigate(['/room-list'], { queryParams: { garden: gardenName } });
    } else {
      this.router.navigate(['/room-list']);
    }
  }

  // ========== BLOG LIST ==========
  posts: Post[] = [
    {
      title: 'Thở 4–7–8: 60s hạ nhịp căng thẳng',
      excerpt: 'Kỹ thuật thở giúp hệ thần kinh dịu nhanh. Dùng trước khi ngủ hay khi thấy tim đập nhanh.',
      icon: 'an-nhien', tag: 'An Nhiên', date: '2025-10-01', link: '/guide/breath-478'
    },
    {
      title: 'Journaling 5 phút khởi động ngày mới',
      excerpt: '3 câu hỏi gợi mở: biết ơn điều gì? điều quan trọng nhất? một việc nhỏ để tử tế hôm nay.',
      icon: 'tam-hon', tag: 'Tâm Hồn', date: '2025-09-26', link: '/guide/5min-journal'
    },
    {
      title: 'Playlist "Deep Focus" 25 phút',
      excerpt: 'Sóng alpha nhẹ giúp vào flow-state. Quy tắc 25–5: làm 25 phút, nghỉ 5 phút.',
      icon: 'cam-hung', tag: 'Cảm Hứng', date: '2025-09-22', link: '/guide/deep-focus'
    },
    {
      title: 'Digital Detox: chơi VR 15 phút đúng cách',
      excerpt: 'Biến game thành bài tập mắt–tay. 5 mẹo để dopamine "sạch" mà vẫn vui.',
      icon: 'cach-mang', tag: 'Cách Mạng', date: '2025-09-15', link: '/guide/vr-detox'
    },
    {
      title: 'Yoga 20 phút: mở vai – lưng trên',
      excerpt: 'Chuỗi flow nhẹ cho người ngồi máy tính nhiều. Không cần dụng cụ.',
      icon: 'an-nhien', tag: 'An Nhiên', date: '2025-09-10', link: '/guide/yoga-20min'
    }
  ];

  trackByTitle = (_: number, p: Post) => p.title;

  // ========== FEEDBACK ==========
  feedbackItems: Feedback[] = [
    {
      name: 'Ngọc Anh',
      tier: 'Diamond',
      role: 'Thành viên Diamond',
      rating: 5,
      text: 'Không gian đẹp, dịch vụ rất chill. Mình thích nhất khu Bình Yên và phần chăm sóc khách hàng.'
    },
    {
      name: 'Hoàng Duy',
      tier: 'Gold',
      role: 'Thành viên Gold',
      rating: 5,
      text: 'App dễ dùng, đặt lịch nhanh. Có thêm vài khung giờ tối muộn thì tuyệt.'
    },
    {
      name: 'Minh Phúc',
      tier: 'Khách mới',
      role: 'Khách hàng',
      rating: 5,
      text: 'Nhân viên nhiệt tình, ưu đãi rõ ràng. Mình sẽ rủ bạn bè quay lại.'
    }
  ];

  getInitial(name: string) {
    if (!name) return '?';
    const p = name.trim().split(/\s+/);
    return (p[0][0] + (p[1]?.[0] || '')).toUpperCase();
  }

  getStars(n: number) {
    return Array.from({ length: Math.max(0, Math.min(5, n)) });
  }

  getTierClass(tier?: Tier) {
    const t = (tier || '').toLowerCase();
    if (t.includes('diamond')) return 'fb-badge--diamond';
    if (t.includes('gold')) return 'fb-badge--gold';
    if (t.includes('silver')) return 'fb-badge--silver';
    if (t.includes('bronze')) return 'fb-badge--bronze';
    if (t.includes('khách mới') || t.includes('mới')) return 'fb-badge--default';
    return 'fb-badge--default';
  }
}
