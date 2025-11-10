import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import vouchersData from '../../assets/data/voucher.json';
import itemsData from '../../assets/data/items.json';
import { Voucher } from '../interfaces/voucher';
import { Items } from '../interfaces/items';

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exchange.html',
  styleUrls: ['./exchange.css']
})
export class Exchange implements OnInit {
  constructor(private http: HttpClient) {}

  // ===== DỮ LIỆU NGƯỜI DÙNG =====
  userPoints: number = 600;

  // ===== DỮ LIỆU VOUCHER & ITEM =====
  vouchers: Voucher[] = (vouchersData as any[]).map(v => ({ ...v, status: 'Còn hiệu lực' }));
  items: Items[] = itemsData as Items[];

  // ===== DANH SÁCH TỈNH & HUYỆN =====
  provinces = [
    { name: 'TP. Hồ Chí Minh', districts: ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'TP. Thủ Đức'] },
    { name: 'Hà Nội', districts: ['Hoàn Kiếm', 'Cầu Giấy', 'Hà Đông', 'Nam Từ Liêm'] },
    { name: 'Đà Nẵng', districts: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'] },
    { name: 'Cần Thơ', districts: ['Ninh Kiều', 'Bình Thủy', 'Cái Răng'] },
    { name: 'Bình Dương', districts: ['Thủ Dầu Một', 'Dĩ An', 'Thuận An'] }
  ];

  ngOnInit(): void {
    this.checkVoucherStatus();
  }

  /** ✅ Kiểm tra trạng thái voucher */
  checkVoucherStatus(): void {
    const today = new Date().toISOString().split('T')[0];
    this.vouchers.forEach(v => {
      if (v.startDate && v.endDate) {
        v.status = v.startDate <= today && today <= v.endDate ? 'Còn hiệu lực' : 'Hết hạn';
      } else {
        v.status = 'Còn hiệu lực';
      }
    });
  }

  /** 🎫 ĐỔI VOUCHER */
  async redeemVoucher(v: Voucher): Promise<void> {
    if (v.status === 'Hết hạn') {
      await Swal.fire({
        icon: 'warning',
        title: 'Voucher đã hết hạn',
        text: 'Vui lòng chọn voucher khác.',
        confirmButtonColor: '#0f89f3'
      });
      return;
    }

    if (this.userPoints < v.pointsRequired) {
      await Swal.fire({
        icon: 'error',
        title: 'Không đủ điểm!',
        text: `Bạn cần thêm ${v.pointsRequired - this.userPoints} điểm để đổi voucher này.`,
        confirmButtonColor: '#0f89f3'
      });
      return;
    }

    const confirmRes = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận đổi voucher?',
      html: `
        <p>Voucher: <b>${v.type}</b></p>
        <p>Điểm cần đổi: <b>${v.pointsRequired.toLocaleString()}</b></p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
      confirmButtonColor: '#0f89f3',
      cancelButtonColor: '#6c757d'
    });

    if (!confirmRes.isConfirmed) return;

    this.userPoints -= v.pointsRequired;
    const code = this.generateCode(v.code);

    await Swal.fire({
      icon: 'success',
      title: 'Đổi voucher thành công!',
      html: `
        <p>Bạn đã đổi voucher <b>${v.type}</b>.</p>
        <div style="margin-top:10px;">Mã voucher của bạn:</div>
        <div style="
          margin-top:6px;display:inline-flex;align-items:center;gap:8px;
          background:#0f89f3;color:#fff;padding:8px 12px;border-radius:8px;">
          <span style="font-weight:700;letter-spacing:.5px;">${code}</span>
          <button id="copyCodeBtn" style="
            border:none;border-radius:6px;background:#fff;color:#0f89f3;
            padding:4px 8px;cursor:pointer;">
            <i class="bi bi-clipboard"></i>
          </button>
        </div>
      `,
      confirmButtonText: 'OK',
      confirmButtonColor: '#0f89f3',
      didOpen: () => {
        const btn = document.getElementById('copyCodeBtn');
        btn?.addEventListener('click', () => {
          navigator.clipboard.writeText(code);
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: 'Đã sao chép mã',
            showConfirmButton: false,
            timer: 1500
          });
        });
      }
    });
  }

  /** 🎁 ĐỔI VẬT PHẨM */
  async redeemItem(item: Items): Promise<void> {
    if (this.userPoints < item.pointsRequired) {
      await Swal.fire({
        icon: 'error',
        title: 'Không đủ điểm!',
        text: `Bạn cần thêm ${item.pointsRequired - this.userPoints} điểm để đổi vật phẩm này.`,
        confirmButtonColor: '#0f89f3'
      });
      return;
    }

    // Form điền thông tin theo hàng dọc
    const htmlForm = `
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

  <div class="container-fluid px-2" style="max-width: 460px; text-align:left; font-size:15px;">
    <div class="mb-3">
      <label for="f_address" class="form-label fw-medium">Địa chỉ (số nhà, đường...)</label>
      <input type="text" id="f_address" class="form-control" placeholder="VD: 12 Nguyễn Huệ, P.Bến Nghé">
    </div>

    <div class="mb-3">
      <label for="f_province" class="form-label fw-medium">Tỉnh / Thành phố</label>
      <select id="f_province" class="form-select">
        <option value="">-- Chọn Tỉnh / Thành phố --</option>
        ${this.provinces
          .map(p => `<option value="${p.name}">${p.name}</option>`)
          .join('')}
      </select>
    </div>

    <div class="mb-3">
      <label for="f_district" class="form-label fw-medium">Quận / Huyện</label>
      <select id="f_district" class="form-select">
        <option value="">-- Chọn Quận / Huyện --</option>
      </select>
    </div>

    <div class="mb-3">
      <label for="f_name" class="form-label fw-medium">Họ và tên</label>
      <input type="text" id="f_name" class="form-control" placeholder="Nguyễn Văn A">
    </div>

    <div class="mb-3">
      <label for="f_phone" class="form-label fw-medium">Số điện thoại</label>
      <input type="text" id="f_phone" class="form-control" placeholder="09xxxxxxxx">
    </div>

    <div id="ship_msg" class="fw-medium text-secondary mt-2"></div>
  </div>
`;

    const result = await Swal.fire({
      icon: 'question',
      title: `Đổi vật phẩm "${item.name}"?`,
      html: htmlForm,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Gửi thông tin',
      cancelButtonText: 'Huỷ',
      confirmButtonColor: '#0f89f3',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
  const provinceSelect = document.getElementById('f_province') as HTMLSelectElement;
  const districtSelect = document.getElementById('f_district') as HTMLSelectElement;
  const shipMsg = document.getElementById('ship_msg') as HTMLElement;

  provinceSelect.addEventListener('change', () => {
    const selected = this.provinces.find(p => p.name === provinceSelect.value);
    districtSelect.innerHTML =
      '<option value="">-- Chọn Quận / Huyện --</option>' +
      (selected?.districts || [])
        .map(d => `<option value="${d}">${d}</option>`)
        .join('');

    // Làm trống khi chưa chọn tỉnh
    if (!provinceSelect.value) {
      shipMsg.innerHTML = '';
      return;
    }

    // Nếu là TP. Hồ Chí Minh → miễn phí ship
    if (provinceSelect.value === 'TP. Hồ Chí Minh') {
      shipMsg.innerHTML = `
        <div class="alert alert-success d-flex align-items-center p-2 mb-0" role="alert"
             style="background-color:#e9fbee; border:1px solid #b8e5c5; color:#117a53; border-radius:6px; margin-top:6px;">
          <input class="form-check-input me-2" type="checkbox" checked disabled>
          <div><strong>Miễn phí ship trong TP.HCM.</strong></div>
        </div>
      `;
    } 
    // Ngoài TP.HCM → có phí
    else {
      shipMsg.innerHTML = `
        <div class="alert alert-warning d-flex align-items-center p-2 mb-0" role="alert"
             style="background-color:#fff9e8; border:1px solid #f2d98b; color:#946200; border-radius:6px; margin-top:6px;">
          <div class="me-2">🚚</div>
          <div><strong>Phí ship 30.000đ (ngoài TP.HCM).</strong></div>
        </div>
      `;
    }
  });
},
      preConfirm: () => {
        const address = (document.getElementById('f_address') as HTMLInputElement)?.value?.trim();
        const province = (document.getElementById('f_province') as HTMLSelectElement)?.value?.trim();
        const district = (document.getElementById('f_district') as HTMLSelectElement)?.value?.trim();
        const name = (document.getElementById('f_name') as HTMLInputElement)?.value?.trim();
        const phone = (document.getElementById('f_phone') as HTMLInputElement)?.value?.trim();

        if (!address || !province || !district || !name || !phone) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ tất cả các trường.');
          return false;
        }
        if (phone.length < 9) {
          Swal.showValidationMessage('Số điện thoại không hợp lệ.');
          return false;
        }
        return { address, province, district, name, phone };
      }
    });

    if (!result.isConfirmed || !result.value) return;

    // Bước xác nhận lại trước khi trừ điểm
    const confirmRes = await Swal.fire({
      icon: 'question',
      title: 'Xác nhận đổi vật phẩm?',
      html: `<p>Bạn chắc chắn muốn đổi <b>${item.name}</b>?</p>
       <p>Điểm cần đổi: <b>${item.pointsRequired.toLocaleString()}</b></p>`,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Huỷ',
      confirmButtonColor: '#0f89f3',
      cancelButtonColor: '#6c757d'
    });

    if (!confirmRes.isConfirmed) return;

    // Trừ điểm & hiện thông báo thành công
    this.userPoints -= item.pointsRequired;
    const isHCM = result.value.province === 'TP. Hồ Chí Minh';
    const feeText = isHCM ? 'Miễn phí ship trong TP.HCM' : 'Phí ship 30.000đ';

    await Swal.fire({
      icon: 'success',
      title: 'Đổi quà thành công!',
      html: `
        <div class="text-start">
          <p><b>Vật phẩm:</b> ${item.name}</p>
          <p><b>Người nhận:</b> ${result.value.name}</p>
          <p><b>Địa chỉ:</b> ${result.value.address}, ${result.value.district}, ${result.value.province}</p>
          <p><b>SĐT:</b> ${result.value.phone}</p>
          <p><b>Chi phí:</b> ${feeText}</p>
          <p><b>Thời gian: </b>Quà sẽ được gửi trong 3-5 ngày làm việc.</p>
        </div>
      `,
      confirmButtonColor: '#0f89f3'
    });
  }

  /** 🔢 Sinh mã voucher ngẫu nhiên */
  private generateCode(prefix: string): string {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  }
}
