export interface Room {
  roomName: string;      // Tên phòng, ví dụ: "Tĩnh Tâm"
  tags: string[];        // Các tag phân loại, ví dụ: ["Oasis", "thiền", "healing"]
  image: string;         // Đường dẫn ảnh trong thư mục assets
  range: string;         // Sức chứa (vd: "1-2 người", "6-10 người")
  description: string;   // Mô tả ngắn gọn về gói phòng
  price: number;         // Giá (VND)
  rating?: number;       // [Optional] Điểm đánh giá trung bình
  reviews?: number;      // [Optional] Số lượt đánh giá
  available?: boolean;   // [Optional] Còn trống hay không
  keywords?: string[];   // [Optional] Từ khóa tìm kiếm bổ sung (vd: ["healing", "thiền", "detox"])
}
