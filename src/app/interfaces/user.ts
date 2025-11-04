export interface User {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;             // dấu ?: Optional
  point?: number;              // Điểm tích lũy
  star?: number;               // Số sao (để xếp hạng thành viên)
  role?: string; 
}
