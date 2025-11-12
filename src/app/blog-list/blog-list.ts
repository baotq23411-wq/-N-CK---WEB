import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type Post = {
  title: string;
  excerpt: string;
  icon: 'an-nhien' | 'tam-hon' | 'cam-hung' | 'cach-mang';
  tag: string;
  date: string;   // ISO string
  link: string;
};

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.html',
  styleUrls: ['./blog-list.css']
})
export class BlogListComponent {
  /** Nếu là trang tổng, bật dropdown sắp xếp (không bắt buộc) */
  @Input() isTravelGuidePage = false;

  posts: Post[] = [
    {
      title: 'Thở 4–7–8: 60s hạ nhịp căng thẳng',
      excerpt:
        'Kỹ thuật thở giúp hệ thần kinh dịu nhanh. Dùng trước khi ngủ hay khi thấy tim đập nhanh.',
      icon: 'an-nhien', tag: 'An Nhiên', date: '2025-10-01', link: '/guide/breath-478'
    },
    {
      title: 'Journaling 5 phút khởi động ngày mới',
      excerpt:
        '3 câu hỏi gợi mở: biết ơn điều gì? điều quan trọng nhất? một việc nhỏ để tử tế hôm nay.',
      icon: 'tam-hon', tag: 'Tâm Hồn', date: '2025-09-26', link: '/guide/5min-journal'
    },
    {
      title: 'Playlist “Deep Focus” 25 phút',
      excerpt:
        'Sóng alpha nhẹ giúp vào flow-state. Quy tắc 25–5: làm 25’, nghỉ 5’.',
      icon: 'cam-hung', tag: 'Cảm Hứng', date: '2025-09-22', link: '/guide/deep-focus'
    },
    {
      title: 'Digital Detox: chơi VR 15’ đúng cách',
      excerpt:
        'Biến game thành bài tập mắt–tay. 5 mẹo để dopamine “sạch” mà vẫn vui.',
      icon: 'cach-mang', tag: 'Cách Mạng', date: '2025-09-15', link: '/guide/vr-detox'
    },
    {
      title: 'Yoga 20’: mở vai – lưng trên',
      excerpt:
        'Chuỗi flow nhẹ cho người ngồi máy tính nhiều. Không cần dụng cụ.',
      icon: 'an-nhien', tag: 'An Nhiên', date: '2025-09-10', link: '/guide/yoga-20min'
    }
  ];

  trackByTitle = (_: number, p: Post) => p.title;
}
