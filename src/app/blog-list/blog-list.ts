import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-blog-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.css'],
})
export class BlogList implements OnInit {
  isTravelGuidePage = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Cập nhật ngay khi component khởi tạo
    this.checkRoute(this.router.url);

    // Lắng nghe sự kiện định tuyến sau này
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkRoute(event.url);
      });
  }

  private checkRoute(url: string) {
    // Nếu URL bắt đầu bằng '/travel-guide', hiển thị mục chọn sắp xếp
    this.isTravelGuidePage = url.startsWith('/travel-guide');
  }
}
