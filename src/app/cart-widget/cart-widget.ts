import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart-widget',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './cart-widget.html',
  styleUrls: ['./cart-widget.css']
})
export class CartWidget implements OnInit, OnDestroy {
  isCartOpen: boolean = false;
  cart: any[] = [];
  private routerSubscription?: Subscription;
  private cartUpdateHandler?: () => void;
  private cartPollingInterval?: any;

  // 🟩 UPDATED: cartCount là getter để luôn trả về số items sau khi gộp
  get cartCount(): number {
    return this.getGroupedCartItems().length;
  }

  // Danh sách routes cần ẩn giỏ hàng
  private hiddenRoutes = ['/payment', '/banking'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
    
    // Đóng giỏ hàng khi chuyển trang
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isCartOpen = false;
        this.loadCart();
      });
    
    // 🟩 ADDED: Listen for cart update events
    this.cartUpdateHandler = () => {
      this.loadCart();
    };
    window.addEventListener('cartUpdated', this.cartUpdateHandler);
    
    // 🟩 ADDED: Polling để cập nhật cart (fallback)
    // ✅ FIXED: Tăng interval từ 500ms lên 2000ms để giảm tải CPU
    this.cartPollingInterval = setInterval(() => {
      // ✅ FIXED: Thêm try-catch cho JSON.parse
      try {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (JSON.stringify(currentCart) !== JSON.stringify(this.cart)) {
        this.loadCart();
      }
      } catch (e) {
        console.error('Error parsing cart from localStorage in polling:', e);
      }
    }, 2000); // Check every 2000ms (2 seconds)
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    // 🟩 ADDED: Remove event listener
    if (this.cartUpdateHandler) {
      window.removeEventListener('cartUpdated', this.cartUpdateHandler);
    }
    // 🟩 ADDED: Clear polling interval
    if (this.cartPollingInterval) {
      clearInterval(this.cartPollingInterval);
    }
  }

  // Kiểm tra xem có nên hiển thị giỏ hàng không
  get shouldShowCart(): boolean {
    const currentUrl = this.router.url;
    return !this.hiddenRoutes.some(route => currentUrl.includes(route));
  }

  // 🧠 Toggle giỏ hàng popup
  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  // 🛒 Load giỏ hàng
  loadCart(): void {
    // ✅ FIXED: Thêm try-catch cho JSON.parse
    try {
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      this.cart = [];
    }
  }

  // 🟩 ADDED: Xóa nhóm items khỏi giỏ (xóa tất cả items trong nhóm)
  removeGroupFromCart(group: any): void {
    const itemsToRemove = (group.originalItems || [group]).map((item: any) => 
      `${item.roomId}_${item.date}_${item.time}`
    );
    const remainingCart = this.cart.filter((c: any) => {
      const key = `${c.roomId}_${c.date}_${c.time}`;
      return !itemsToRemove.includes(key);
    });
    
    localStorage.setItem('cart', JSON.stringify(remainingCart));
    this.cart = remainingCart;
    this.loadCart();
    // 🟩 ADDED: Dispatch event để các component khác cập nhật
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  // 🟩 ADDED: Nhóm các items trong giỏ hàng và gộp giờ liên tiếp
  getGroupedCartItems(): any[] {
    if (this.cart.length === 0) return [];
    
    const merged = this.mergeConsecutiveBookings([...this.cart]);
    
    // Chuyển đổi thành format để hiển thị trong giỏ hàng
    return merged.map(group => ({
      roomId: group.roomId,
      roomName: group.roomName,
      photo: group.photo,
      date: group.date,
      time: group.time,
      totalPrice: group.totalPrice,
      expertServices: group.expertServices || [],
      extraServices: group.extraServices || [],
      originalItems: group.originalItems || [group]
    }));
  }

  // 🟩 ADDED: Gộp các bookings liên tiếp của cùng một phòng
  private mergeConsecutiveBookings(cart: any[]): any[] {
    if (cart.length === 0) return [];
    
    // Nhóm theo roomId và date
    const grouped: { [key: string]: any[] } = {};
    cart.forEach(item => {
      const key = `${item.roomId}_${item.date}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    const merged: any[] = [];
    
    // Xử lý từng nhóm (theo roomId và date)
    Object.values(grouped).forEach((group: any) => {
      // Sắp xếp theo time
      group.sort((a: any, b: any) => {
        const [aStart] = a.time.split(' - ').map((t: string) => this.timeToMinutes(t.trim()));
        const [bStart] = b.time.split(' - ').map((t: string) => this.timeToMinutes(t.trim()));
        return aStart - bStart;
      });
      
      let currentGroup: any = null;
      
      group.forEach((item: any) => {
        if (!currentGroup) {
          currentGroup = {
            roomId: item.roomId,
            roomName: item.roomName,
            photo: item.photo,
            date: item.date,
            time: item.time,
            basePrice: item.basePrice || 0,
            totalPrice: item.totalPrice || 0,
            expertServices: [...(item.expertServices || [])],
            extraServices: [...(item.extraServices || [])],
            originalItems: [item]
          };
          merged.push(currentGroup);
          return;
        }
        
        // Kiểm tra xem có thể gộp không (giờ liên tiếp)
        if (this.isConsecutiveTime(currentGroup.time, item.time)) {
          // Gộp vào nhóm hiện tại
          const [startTime, endTime] = currentGroup.time.split(' - ').map((t: string) => t.trim());
          const [itemStart, itemEnd] = item.time.split(' - ').map((t: string) => t.trim());
          
          // Cập nhật time range
          currentGroup.time = `${startTime} - ${itemEnd}`;
          
          // Cộng dồn basePrice và totalPrice
          currentGroup.basePrice += (item.basePrice || 0);
          currentGroup.totalPrice += (item.totalPrice || 0);
          
          // Gộp dịch vụ chuyên gia (tránh trùng lặp theo name)
          (item.expertServices || []).forEach((ex: any) => {
            const existing = currentGroup.expertServices.find((e: any) => 
              (e.name && ex.name && e.name.trim().toLowerCase() === ex.name.trim().toLowerCase()) ||
              (e.id !== undefined && ex.id !== undefined && String(e.id) === String(ex.id))
            );
            if (!existing) {
              currentGroup.expertServices.push({ ...ex });
            }
          });
          
          // Gộp dịch vụ thuê thêm (cộng dồn quantity)
          (item.extraServices || []).forEach((ext: any) => {
            const existing = currentGroup.extraServices.find((e: any) => 
              (e.name && ext.name && e.name.trim().toLowerCase() === ext.name.trim().toLowerCase()) ||
              (e.id !== undefined && ext.id !== undefined && String(e.id) === String(ext.id))
            );
            if (existing) {
              existing.quantity = (existing.quantity || 1) + (ext.quantity || 1);
            } else {
              currentGroup.extraServices.push({ ...ext, quantity: ext.quantity || 1 });
            }
          });
          
          currentGroup.originalItems.push(item);
        } else {
          // Tạo nhóm mới
          currentGroup = {
            roomId: item.roomId,
            roomName: item.roomName,
            photo: item.photo,
            date: item.date,
            time: item.time,
            basePrice: item.basePrice || 0,
            totalPrice: item.totalPrice || 0,
            expertServices: [...(item.expertServices || [])],
            extraServices: [...(item.extraServices || [])],
            originalItems: [item]
          };
          merged.push(currentGroup);
        }
      });
    });
    
    return merged;
  }

  // Kiểm tra xem 2 khoảng thời gian có liên tiếp không
  private isConsecutiveTime(time1: string, time2: string): boolean {
    const [start1, end1] = time1.split(' - ').map(t => this.timeToMinutes(t));
    const [start2] = time2.split(' - ').map(t => this.timeToMinutes(t));
    
    // Liên tiếp nếu end1 === start2
    return end1 === start2;
  }

  // Chuyển đổi thời gian thành phút (ví dụ: "14:00" -> 840)
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  // 🟩 ADDED: Thanh toán cho nhóm
  goToPaymentForGroup(group: any): void {
    this.isCartOpen = false;
    
    // Chuyển đổi group thành processedBookings format
    const processedBookings = [{
      roomId: group.roomId,
      roomName: group.roomName,
      date: group.date,
      time: group.time,
      basePrice: group.totalPrice - 
        (group.expertServices || []).reduce((sum: number, s: any) => sum + (s.price || 0), 0) -
        (group.extraServices || []).reduce((sum: number, s: any) => sum + (s.price || 0) * (s.quantity || 1), 0),
      totalPrice: group.totalPrice,
      expertServices: group.expertServices || [],
      extraServices: group.extraServices || []
    }];
    
    // Xóa paymentState và selectedBooking cũ
    localStorage.removeItem('paymentState');
    localStorage.removeItem('selectedBooking');
    
    // Lưu vào localStorage để payment đọc
    localStorage.setItem('processedBookings', JSON.stringify(processedBookings));
    
    // Xóa items đã thanh toán khỏi giỏ hàng
    const itemsToRemove = (group.originalItems || [group]).map((item: any) => 
      `${item.roomId}_${item.date}_${item.time}`
    );
    const remainingCart = this.cart.filter((c: any) => {
      const key = `${c.roomId}_${c.date}_${c.time}`;
      return !itemsToRemove.includes(key);
    });
    
    localStorage.setItem('cart', JSON.stringify(remainingCart));
    this.cart = remainingCart;
    
    // Chuyển đến trang payment
    this.router.navigate(['/payment']);
  }
}

