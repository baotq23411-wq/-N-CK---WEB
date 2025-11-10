/**
 * Interface đại diện cho nhóm dịch vụ riêng của từng phòng.
 * Dữ liệu được ánh xạ từ file addservices.json
 */
export interface AddServiceGroup {
  roomId: number;            // Liên kết với Room.id
  roomName: string;          // Tên hiển thị của phòng
  services: AddServiceItem[];// Danh sách dịch vụ riêng của phòng
}

/**
 * Interface cho từng dịch vụ chi tiết trong nhóm.
 */
export interface AddServiceItem {
  id: number;                // ID duy nhất cho dịch vụ
  name: string;              // Tên dịch vụ
  price: number;             // Giá dịch vụ
  description?: string;      // Mô tả chi tiết
  icon?: string;             // Icon hiển thị (Bootstrap icon)
  active?: boolean;          // Trạng thái tick chọn trong UI
}
