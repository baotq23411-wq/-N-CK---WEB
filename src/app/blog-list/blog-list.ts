import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface PanaceaArticle {
  image: string;
  title: string;
  shortDescription: string;
  readMoreLink: string;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.css'],
})
export default class BlogListPanacea {
  articles: PanaceaArticle[] = [
    {
      image: '/assets/PuLuong.jpg',
      title: 'Hướng dẫn đặt phòng tại Panacea',
      shortDescription: 'Tìm hiểu các bước chi tiết để đặt phòng tại Panacea một cách dễ dàng và nhanh chóng nhất.',
      readMoreLink: '/detail-travel-guide'
    },
    {
      image: '/assets/uc.jpg',
      title: 'Chính sách hủy và đổi ngày',
      shortDescription: 'Thông tin về chính sách hủy phòng, đổi ngày và các điều khoản liên quan khi đặt phòng tại Panacea.',
      readMoreLink: '/detail-travel-guide'
    },
    {
      image: '/assets/PuLuong.jpg',
      title: 'Các loại phòng và tiện ích',
      shortDescription: 'Khám phá các loại phòng đa dạng tại Panacea cùng với các tiện ích và dịch vụ đi kèm.',
      readMoreLink: '/detail-travel-guide'
    },
    {
      image: '/assets/uc.jpg',
      title: 'Thanh toán và ưu đãi đặc biệt',
      shortDescription: 'Tìm hiểu các phương thức thanh toán và các chương trình ưu đãi, khuyến mãi hấp dẫn.',
      readMoreLink: '/detail-travel-guide'
    },
    {
      image: '/assets/PuLuong.jpg',
      title: 'Quy định check-in và check-out',
      shortDescription: 'Thông tin về thời gian check-in, check-out và các quy định cần lưu ý khi lưu trú tại Panacea.',
      readMoreLink: '/detail-travel-guide'
    },
    {
      image: '/assets/uc.jpg',
      title: 'Các khách hàng nói gì về Panacea',
      shortDescription: 'Lắng nghe cảm nhận và chia sẻ thực tế từ những khách hàng đã trải nghiệm tại Panacea Resort.',
      readMoreLink: '/detail-travel-guide'
    }

  ];
}