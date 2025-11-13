import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
}
@Component({
  selector: 'app-coin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coin.html',
  styleUrl: './coin.css',
})
export class Coin {
faqList: FAQItem[] = [
    { question: 'Tại sao Điểm Cơ Bản và Điểm Priority của tôi biến mất?', answer: 'Điểm có thể được chuyển đổi hoặc cập nhật do thay đổi trong chương trình thưởng của Panacea.' },
    { question: 'Điểm Priority của tôi có ảnh hưởng đến tiến trình không?', answer: 'Không, điểm Priority hoạt động độc lập và không ảnh hưởng đến tiến trình của bạn.' },
    { question: 'Làm thế nào để kích hoạt Xu?', answer: 'Xu được kích hoạt tự động khi bạn hoàn tất giao dịch và có hạn sử dụng tùy từng loại.' },
    { question: 'Xu có thời hạn không?', answer: 'Không, Xu có thời hạn vĩnh viễn' },
    { question: 'Tôi nên làm gì nếu Xu của tôi bị mất?', answer: 'Hãy liên hệ Trung tâm Trợ giúp của Panacea để được kiểm tra lại lịch sử tài khoản.' },
    { question: 'Có giới hạn nào khi đổi Xu không?', answer: 'Có, mỗi loại ưu đãi có giới hạn riêng, bạn có thể xem chi tiết trong phần điều khoản.' },
    { question: 'Làm thế nào để tích Xu?', answer: 'Hoàn tất các giao dịch hợp lệ hoặc tham gia chương trình khuyến mãi của Panacea, với mỗi 1.000 VNĐ sẽ được 1 Xu.' },
    { question: 'Tôi có thể sử dụng Xu để làm gì?', answer: 'Bạn có thể dùng Xu để giảm giá cho dịch vụ đặt phòng hoặc đổi các vật phẩm khác.' },
    { question: 'Có thể hoàn lại Xu không?', answer: 'Không, Xu đã sử dụng không thể hoàn lại.' }
  ];

  ngAfterViewInit() {
    const bg = document.getElementById('bg');
    if (!bg) return;

    document.addEventListener('mousemove', (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      bg.style.backgroundPosition = `
        ${10 + (x - 0.5) * 10}% ${50 + (y - 0.5) * 10}%,
        ${90 + (x - 0.5) * 15}% ${50 + (y - 0.5) * 15}%,
        ${50 + (x - 0.5) * 5}% ${50 + (y - 0.5) * 5}%
      `;
    });
  }
}


