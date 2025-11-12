import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type Garden = {
  key: 'an-nhien' | 'tam-hon' | 'cam-hung' | 'cach-mang';
  title: string;
  subtitle: string;
  desc: string;
  link: string;
  cover: string; // đường dẫn ảnh
};

@Component({
  selector: 'app-gardens',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gardens.html',
  styleUrls: ['./gardens.css'],
})
export class GardensComponent {
  gardens: Garden[] = [
    {
      key: 'an-nhien',
      title: 'Serenity — Bình Yên',
      subtitle: 'Meditation & Mindfulness',
      desc: 'Thiền định, yoga, hơi thở. Tìm về bình an nội tâm.',
      link: '/gardens/an-nhien',
      cover: 'assets/images/annhien.png',
    },
    {
      key: 'tam-hon',
      title: 'Harmony — Hài Hoà',
      subtitle: 'Sound Healing',
      desc: 'Âm thanh trị liệu, nhạc cụ, karaoke thư giãn.',
      link: '/gardens/tam-hon',
      cover: 'assets/images/tamhon.png',
    },
    {
      key: 'cam-hung',
      title: 'Bloom — Nở Rộ',
      subtitle: 'Creative Arts',
      desc: 'Hội hoạ, craft, workshop. Tự do biểu đạt & sáng tạo.',
      link: '/gardens/cam-hung',
      cover: 'assets/images/camhung.png',
    },
    {
      key: 'cach-mang',
      title: 'Mutiny — Bùng Nổ',
      subtitle: 'Gaming & Play',
      desc: 'VR, board games, thử thách thể lực. Xả stress lành mạnh.',
      link: '/gardens/cach-mang',
      cover: 'assets/images/cachmang.png',
    },
  ];

  trackByKey = (_: number, g: Garden) => g.key;
}
