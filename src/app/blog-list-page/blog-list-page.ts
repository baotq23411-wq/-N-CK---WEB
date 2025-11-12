import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface PanaceaArticle {
  icon: string; // Bootstrap Icon class (e.g., 'bi bi-calendar-check')
  title: string;
  shortDescription: string;
  readMoreLink: string;
  fullContent: string; // Nội dung đầy đủ của bài blog
}

@Component({
  selector: 'app-blog-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list-page.html',
  styleUrls: ['./blog-list-page.css'],
})
export class BlogListPage {
  selectedArticle: PanaceaArticle | null = null;
  showModal = false;

  constructor(private sanitizer: DomSanitizer) {}

  getSafeHtml(content: string | undefined): SafeHtml {
    if (!content) return '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  articles: PanaceaArticle[] = [
    {
      icon: 'bi bi-calendar-check',
      title: 'Hướng dẫn đặt phòng tại Panacea',
      shortDescription: 'Tìm hiểu các bước chi tiết để đặt phòng tại Panacea một cách dễ dàng và nhanh chóng nhất.',
      readMoreLink: '/detail-travel-guide',
      fullContent: `
        <h4 class="mb-4">Hướng dẫn đặt phòng tại Panacea</h4>
        <p class="lead">Đặt phòng tại Panacea rất đơn giản và nhanh chóng. Chỉ cần vài bước, bạn đã có thể sở hữu một trải nghiệm tuyệt vời.</p>
        
        <h5 class="mt-4 mb-3">Bước 1: Chọn khu vực và dịch vụ</h5>
        <p>Truy cập trang đặt phòng và chọn một trong 4 khu vực của Panacea:</p>
        <ul>
          <li><strong>Catharsis - Vườn An Nhiên:</strong> Yoga, Thiền định, Massage trị liệu, Phòng xông hơi thảo dược</li>
          <li><strong>Oasis - Vườn Tâm Hồn:</strong> Tư vấn tâm lý, Viết nhật ký trị liệu, Phòng lắng nghe</li>
          <li><strong>Genii - Vườn Cảm Hứng:</strong> Vẽ tranh, Nghệ thuật thủ công, Âm nhạc trị liệu</li>
          <li><strong>Mutiny - Vườn Cách Mạng:</strong> Phòng đập phá an toàn, Bắn cung, Trò chơi vận động</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Bước 2: Chọn thời gian</h5>
        <p>Chọn ngày và khung giờ phù hợp với lịch trình của bạn. Hệ thống sẽ hiển thị các slot còn trống.</p>
        
        <h5 class="mt-4 mb-3">Bước 3: Xác nhận và thanh toán</h5>
        <p>Kiểm tra lại thông tin đặt phòng, chọn phương thức thanh toán và hoàn tất đặt phòng. Bạn sẽ nhận được email xác nhận ngay sau đó.</p>
        
        <div class="alert alert-info mt-4">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Lưu ý:</strong> Nên đặt phòng trước 1-2 ngày, đặc biệt vào cuối tuần để đảm bảo có chỗ.
        </div>
      `
    },
    {
      icon: 'bi bi-arrow-left-right',
      title: 'Chính sách hủy và đổi ngày',
      shortDescription: 'Thông tin về chính sách hủy phòng, đổi ngày và các điều khoản liên quan khi đặt phòng tại Panacea.',
      readMoreLink: '/detail-travel-guide',
      fullContent: `
        <h4 class="mb-4">Chính sách hủy và đổi ngày</h4>
        <p class="lead">Panacea hiểu rằng đôi khi bạn cần thay đổi kế hoạch. Chúng tôi có chính sách linh hoạt để hỗ trợ bạn.</p>
        
        <h5 class="mt-4 mb-3">Đổi ngày</h5>
        <p>Bạn có thể đổi ngày đặt phòng miễn phí nếu thông báo trước <strong>ít nhất 12 giờ</strong> so với thời gian đã đặt. Chỉ cần vào mục "Đặt phòng của tôi" và chọn "Đổi ngày".</p>
        
        <h5 class="mt-4 mb-3">Hủy phòng và hoàn tiền</h5>
        <ul>
          <li><strong>Hủy trước 12 giờ:</strong> Hoàn 100% số tiền đã thanh toán</li>
          <li><strong>Hủy trước 6-12 giờ:</strong> Hoàn 50% số tiền đã thanh toán</li>
          <li><strong>Hủy dưới 6 giờ:</strong> Không hoàn tiền</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Quy trình hủy/đổi</h5>
        <ol>
          <li>Đăng nhập vào tài khoản của bạn</li>
          <li>Vào mục "Đặt phòng của tôi"</li>
          <li>Chọn đặt phòng cần hủy/đổi</li>
          <li>Chọn "Hủy phòng" hoặc "Đổi ngày"</li>
          <li>Xác nhận thao tác</li>
        </ol>
        
        <div class="alert alert-warning mt-4">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Lưu ý:</strong> Tiền hoàn lại sẽ được chuyển về tài khoản trong vòng 3-5 ngày làm việc.
        </div>
      `
    },
    {
      icon: 'bi bi-house-door',
      title: 'Các loại phòng và tiện ích',
      shortDescription: 'Khám phá các loại phòng đa dạng tại Panacea cùng với các tiện ích và dịch vụ đi kèm.',
      readMoreLink: '/detail-travel-guide',
      fullContent: `
        <h4 class="mb-4">Các loại phòng và tiện ích</h4>
        <p class="lead">Panacea cung cấp 4 khu vực độc đáo, mỗi khu vực mang đến những trải nghiệm riêng biệt.</p>
        
        <h5 class="mt-4 mb-3">Catharsis - Vườn An Nhiên</h5>
        <p>Dành cho những ai muốn tìm lại sự bình yên và cân bằng:</p>
        <ul>
          <li>Phòng Yoga (Hatha, Vinyasa, Yin)</li>
          <li>Phòng Thiền định với không gian yên tĩnh</li>
          <li>Phòng Massage trị liệu chuyên nghiệp</li>
          <li>Phòng xông hơi thảo dược tự nhiên</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Oasis - Vườn Tâm Hồn</h5>
        <p>Không gian hỗ trợ tâm lý và cảm xúc:</p>
        <ul>
          <li>Phòng tư vấn tâm lý 1-1 riêng tư</li>
          <li>Không gian viết nhật ký trị liệu</li>
          <li>Phòng lắng nghe với âm thanh trị liệu</li>
          <li>Workshop quản lý cảm xúc</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Genii - Vườn Cảm Hứng</h5>
        <p>Nơi sáng tạo không giới hạn:</p>
        <ul>
          <li>Studio vẽ tranh tự do</li>
          <li>Không gian nghệ thuật thủ công</li>
          <li>Phòng âm nhạc trị liệu</li>
          <li>Workshop sáng tạo nhóm</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Mutiny - Vườn Cách Mạng</h5>
        <p>Giải tỏa căng thẳng một cách an toàn:</p>
        <ul>
          <li>Phòng đập phá an toàn với đồ bảo hộ</li>
          <li>Sân bắn cung chuyên nghiệp</li>
          <li>Khu vực trò chơi vận động</li>
        </ul>
        
        <div class="alert alert-success mt-4">
          <i class="bi bi-check-circle me-2"></i>
          <strong>Tất cả phòng đều được trang bị đầy đủ dụng cụ và thiết bị cần thiết.</strong>
        </div>
      `
    },
    {
      icon: 'bi bi-credit-card',
      title: 'Thanh toán và ưu đãi đặc biệt',
      shortDescription: 'Tìm hiểu các phương thức thanh toán và các chương trình ưu đãi, khuyến mãi hấp dẫn.',
      readMoreLink: '/detail-travel-guide',
      fullContent: `
        <h4 class="mb-4">Thanh toán và ưu đãi đặc biệt</h4>
        <p class="lead">Panacea cung cấp nhiều phương thức thanh toán tiện lợi và các chương trình ưu đãi hấp dẫn.</p>
        
        <h5 class="mt-4 mb-3">Phương thức thanh toán</h5>
        <ul>
          <li><strong>Thẻ tín dụng/ghi nợ:</strong> Visa, Mastercard, JCB</li>
          <li><strong>Ví điện tử:</strong> MoMo, ZaloPay, VNPay</li>
          <li><strong>Chuyển khoản ngân hàng:</strong> Tất cả các ngân hàng tại Việt Nam</li>
          <li><strong>Panacea Points:</strong> Sử dụng điểm tích lũy để thanh toán</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Panacea Points - Chương trình tích điểm</h5>
        <p>Bạn sẽ nhận được điểm khi:</p>
        <ul>
          <li>Đánh giá dịch vụ sau khi sử dụng: <strong>50 điểm</strong></li>
          <li>Đặt phòng thường xuyên: <strong>100 điểm/lần</strong></li>
          <li>Giới thiệu bạn bè: <strong>200 điểm/người</strong></li>
        </ul>
        <p><strong>Quy đổi:</strong> 100 điểm = 10.000 VNĐ. Điểm có thể dùng để giảm giá hoặc thanh toán trực tiếp.</p>
        
        <h5 class="mt-4 mb-3">Ưu đãi đặc biệt</h5>
        <ul>
          <li><strong>Combo 3 buổi:</strong> Giảm 15% khi đặt 3 buổi cùng lúc</li>
          <li><strong>Thành viên mới:</strong> Giảm 20% cho lần đặt đầu tiên</li>
          <li><strong>Ngày sinh nhật:</strong> Tặng 1 buổi miễn phí trong tháng sinh nhật</li>
          <li><strong>Nhóm 5 người trở lên:</strong> Giảm 10% cho toàn bộ nhóm</li>
        </ul>
        
        <div class="alert alert-primary mt-4">
          <i class="bi bi-gift me-2"></i>
          <strong>Mẹo:</strong> Theo dõi fanpage và email để nhận thông báo về các chương trình khuyến mãi đặc biệt!
        </div>
      `
    },
    {
      icon: 'bi bi-clock-history',
      title: 'Quy định check-in và check-out',
      shortDescription: 'Thông tin về thời gian check-in, check-out và các quy định cần lưu ý khi lưu trú tại Panacea.',
      readMoreLink: '/detail-travel-guide',
      fullContent: `
        <h4 class="mb-4">Quy định check-in và check-out</h4>
        <p class="lead">Để đảm bảo trải nghiệm tốt nhất cho tất cả khách hàng, vui lòng tuân thủ các quy định sau.</p>
        
        <h5 class="mt-4 mb-3">Giờ hoạt động</h5>
        <p><strong>Panacea hoạt động từ 8:00 - 20:00</strong> tất cả các ngày trong tuần, kể cả thứ 7 và Chủ nhật.</p>
        
        <h5 class="mt-4 mb-3">Check-in</h5>
        <ul>
          <li><strong>Thời gian:</strong> Vui lòng đến trước 10 phút so với giờ đặt phòng</li>
          <li><strong>Thủ tục:</strong> Xuất trình email xác nhận hoặc mã đặt phòng tại quầy lễ tân</li>
          <li><strong>Đồ dùng cá nhân:</strong> Một số dịch vụ yêu cầu mang theo đồ dùng riêng (sẽ được thông báo trước)</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Trong quá trình sử dụng</h5>
        <ul>
          <li>Tuân thủ hướng dẫn của nhân viên và chuyên gia</li>
          <li>Giữ gìn vệ sinh chung, không làm ồn ảnh hưởng đến người khác</li>
          <li>Sử dụng thiết bị và dụng cụ đúng cách</li>
          <li>Không mang đồ ăn, thức uống vào một số khu vực đặc biệt</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Check-out</h5>
        <ul>
          <li><strong>Thời gian:</strong> Kết thúc đúng giờ đã đặt, không được kéo dài quá 10 phút</li>
          <li><strong>Trả lại dụng cụ:</strong> Vui lòng trả lại tất cả dụng cụ đã mượn về đúng vị trí</li>
          <li><strong>Đánh giá:</strong> Chúng tôi rất mong nhận được phản hồi của bạn để cải thiện dịch vụ</li>
        </ul>
        
        <h5 class="mt-4 mb-3">Quy định đặc biệt</h5>
        <ul>
          <li>Trẻ em dưới 12 tuổi cần có người lớn đi kèm</li>
          <li>Một số dịch vụ yêu cầu sức khỏe tốt (sẽ được tư vấn trước)</li>
          <li>Không được mang theo vật nuôi</li>
        </ul>
        
        <div class="alert alert-info mt-4">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Lưu ý:</strong> Nếu bạn đến muộn, thời gian sử dụng sẽ bị rút ngắn tương ứng. Vui lòng đến đúng giờ!
        </div>
      `
    },
    {
      icon: 'bi bi-star-fill',
      title: 'Các khách hàng nói gì về Panacea',
      shortDescription: 'Lắng nghe cảm nhận và chia sẻ thực tế từ những khách hàng đã trải nghiệm tại Panacea Resort.',
      readMoreLink: '/detail-travel-guide',
      fullContent: `
        <h4 class="mb-4">Các khách hàng nói gì về Panacea</h4>
        <p class="lead">Hơn 10.000 khách hàng đã tin tưởng và trải nghiệm dịch vụ của Panacea. Dưới đây là một số chia sẻ từ họ.</p>
        
        <div class="testimonial-card p-4 mb-4 bg-light rounded">
          <div class="d-flex align-items-center mb-3">
            <div class="testimonial-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
              <strong>LN</strong>
            </div>
            <div>
              <strong>Lan Nguyễn</strong>
              <div class="text-warning">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
          </div>
          <p class="mb-0">"Tôi đã thử lớp Yoga tại Catharsis và thực sự ấn tượng. Không gian rất yên tĩnh, giáo viên chuyên nghiệp. Sau buổi học, tôi cảm thấy thư giãn hoàn toàn. Sẽ quay lại!"</p>
        </div>
        
        <div class="testimonial-card p-4 mb-4 bg-light rounded">
          <div class="d-flex align-items-center mb-3">
            <div class="testimonial-avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
              <strong>MT</strong>
            </div>
            <div>
              <strong>Minh Trần</strong>
              <div class="text-warning">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
          </div>
          <p class="mb-0">"Mutiny thực sự là nơi giải tỏa stress tuyệt vời! Phòng đập phá rất an toàn với đầy đủ đồ bảo hộ. Sau khi thử, tôi cảm thấy nhẹ nhõm hơn rất nhiều. Rất đáng để thử!"</p>
        </div>
        
        <div class="testimonial-card p-4 mb-4 bg-light rounded">
          <div class="d-flex align-items-center mb-3">
            <div class="testimonial-avatar bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
              <strong>HT</strong>
            </div>
            <div>
              <strong>Hương Trần</strong>
              <div class="text-warning">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-half"></i>
              </div>
            </div>
          </div>
          <p class="mb-0">"Tư vấn tâm lý tại Oasis rất chuyên nghiệp. Chuyên gia lắng nghe và đưa ra lời khuyên rất hữu ích. Không gian riêng tư, thoải mái. Tôi đã đặt thêm 3 buổi nữa."</p>
        </div>
        
        <div class="testimonial-card p-4 mb-4 bg-light rounded">
          <div class="d-flex align-items-center mb-3">
            <div class="testimonial-avatar bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 50px; height: 50px;">
              <strong>DK</strong>
            </div>
            <div>
              <strong>Đức Khang</strong>
              <div class="text-warning">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
          </div>
          <p class="mb-0">"Workshop vẽ tranh tại Genii thật sự thú vị! Tôi không biết vẽ nhưng được hướng dẫn rất tận tình. Kết quả là một bức tranh đẹp mà tôi tự hào. Cảm ơn Panacea!"</p>
        </div>
        
        <div class="alert alert-success mt-4">
          <i class="bi bi-heart-fill me-2"></i>
          <strong>Đánh giá trung bình:</strong> 4.8/5 sao từ hơn 2.500 đánh giá
        </div>
      `
    }
  ];

  openModal(article: PanaceaArticle) {
    this.selectedArticle = article;
    this.showModal = true;
    // Ngăn scroll body khi modal mở
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.selectedArticle = null;
    // Khôi phục scroll body
    document.body.style.overflow = 'auto';
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: Event) {
    if (this.showModal) {
      this.closeModal();
    }
  }
}