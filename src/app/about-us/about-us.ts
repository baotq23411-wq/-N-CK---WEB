import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class AboutUsComponent {
  readonly year = new Date().getFullYear();

  stats: Stat[] = [
    { value: '2,000+', label: 'Khách đã trải nghiệm', note: 'trong năm 2024' },
    { value: '500+',  label: 'Đánh giá 5★',           note: 'từ cộng đồng' },
    { value: '30+',   label: 'Hoạt động trị liệu',     note: 'đa dạng & an toàn' },
    { value: '10+',   label: 'Đối tác chuyên gia',     note: 'tâm lý & thiền' },
  ];

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
    { name: 'Member 01', role: 'Founder / Facilitator' },
    { name: 'Member 02', role: 'Experience Designer' },
    { name: 'Member 03', role: 'Therapy Coordinator' },
    { name: 'Member 04', role: 'Community Lead' },
  ];
}
