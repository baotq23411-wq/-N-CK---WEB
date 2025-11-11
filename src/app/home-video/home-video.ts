import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-video.html',
  styleUrls: ['./home-video.css']
})
export class HomeVideoComponent {
  /** Đường dẫn MP4, ví dụ: 'assets/video/panacea.mp4' */
  @Input({ required: true }) src = 'assets/video/panacea.mp4';

  /** Ảnh bìa hiển thị khi video chưa tải xong (tùy chọn) */
  @Input() poster = '';

  /** Mô tả a11y */
  @Input() title = 'Video';
}
