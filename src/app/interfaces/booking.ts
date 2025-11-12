import { Room } from './room';
import { Voucher } from './voucher';  
import { AddServiceItem } from './addservice';

/**
 * Đơn đặt phòng (Booking)
 * Liên kết với Room, Voucher (qua voucherCode) và AddServiceItem.
 */
export interface Booking {
  id: string;                           // Mã đơn đặt phòng
  roomId: string;                       // FK → Room.id
  room?: Room;                          // Thông tin chi tiết phòng (optional)
  range: string;                       // Phạm vi sức chứa đã chọn
  services: AddServiceItem[];           // Danh sách dịch vụ đi kèm

  startTime: string;                    // Giờ bắt đầu sử dụng mm:hh dd/mm/yyyy
  endTime: string;                        // Giờ kết thúc sử dụng mm:hh dd/mm/yyyy
  checkInTime: string;                    // Giờ nhận phòng mm:hh dd/mm/yyyy
  checkOutTime: string;                   // Giờ trả phòng mm:hh dd/mm/yyyy

  // 🔗 Liên kết đến voucher.ts qua voucherCode
  voucherCode?: Voucher['code'];        // Mã giảm giá (tham chiếu type Voucher.code)
  discountValue?: number;               // Số tiền giảm thực tế
  totalPrice: number;                   // Tổng tiền sau giảm

  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'; // Trạng thái

  // Thông tin khách hàng nhập trong form
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  rewardPointsEarned?: number;          // Số điểm Xu nhận được
}
