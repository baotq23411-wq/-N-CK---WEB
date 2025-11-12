import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Khách mới' | string;

type Feedback = {
  name: string;
  tier?: Tier;
  role?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class FeedbackComponent {
  items: Feedback[] = [
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
    if (t.includes('diamond')) return 'badge--diamond';
    if (t.includes('gold')) return 'badge--gold';
    if (t.includes('silver')) return 'badge--silver';
    if (t.includes('bronze')) return 'badge--bronze';
    return 'badge--default';
  }
}
