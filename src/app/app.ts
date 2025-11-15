import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { HeaderComponent } from './header/header';
import { FooterComponent } from './footer/footer';
import { CartWidget } from './cart-widget/cart-widget';
import { AuthService } from './services/auth';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, HeaderComponent, FooterComponent, CartWidget],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('panacea');
  private routerSubscription?: Subscription;
  isAdminRoute = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private pwaService: PwaService
  ) {}

  ngOnInit(): void {
    // ✅ Khởi tạo PWA
    this.pwaService.initPwa();
    
    // ✅ Scroll to top ngay khi component khởi tạo (khi reload trang)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // ✅ Scroll to top khi navigate đến trang mới
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Kiểm tra xem có phải admin route không
        this.isAdminRoute = event.url.startsWith('/admin-');
        this.toggleChatbot(!this.isAdminRoute);
        
        // Nếu user là admin và đã đăng nhập, tự động redirect tới /admin-dashboard khi mở app
        if (this.authService.isLoggedIn() && this.authService.isAdmin() && event.url === '/') {
          console.log('[App] Admin đã đăng nhập, tự động redirect tới /admin-dashboard');
          this.router.navigate(['/admin-dashboard']);
          return;
        }
        
        // Sử dụng setTimeout để đảm bảo DOM đã render
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }, 0);
      });
    
    // Kiểm tra ngay khi khởi tạo component
    const currentUrl = this.router.url;
    this.isAdminRoute = currentUrl.startsWith('/admin-');
    this.toggleChatbot(!this.isAdminRoute);
    
    // Tự động redirect admin khi mở app lần đầu nếu đã login
    if (this.authService.isLoggedIn() && this.authService.isAdmin() && currentUrl === '/') {
      console.log('[App] Admin đã đăng nhập, tự động redirect tới /admin-dashboard');
      setTimeout(() => {
        this.router.navigate(['/admin-dashboard']);
      }, 0);
    }
  }

  /**
   * Ẩn/hiện chatbot widget khi ở admin routes
   */
  private toggleChatbot(show: boolean): void {
    // Thêm/xóa class trên body để dùng CSS selector
    if (show) {
      document.body.classList.remove('admin-route');
    } else {
      document.body.classList.add('admin-route');
    }
    
    setTimeout(() => {
      // Tìm custom elements chatbot (chat-launcher và chat-window)
      const chatLauncher = document.querySelector('chat-launcher');
      const chatWindow = document.querySelector('chat-window');
      const chatWidget = document.querySelector('chat-widget-container');
      
      if (chatLauncher) {
        const launcherEl = chatLauncher as HTMLElement;
        if (show) {
          launcherEl.style.cssText = '';
        } else {
          launcherEl.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
        }
      }
      if (chatWindow) {
        const windowEl = chatWindow as HTMLElement;
        if (show) {
          windowEl.style.cssText = '';
        } else {
          windowEl.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
        }
      }
      if (chatWidget) {
        const widgetEl = chatWidget as HTMLElement;
        if (show) {
          widgetEl.style.cssText = '';
        } else {
          widgetEl.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
        }
      }
      
      // Tìm các element có attribute data-webhook-url (các element được tạo bởi script)
      const chatbotElements = document.querySelectorAll('[data-webhook-url]:not(script)');
      chatbotElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        if (show) {
          htmlElement.style.cssText = '';
        } else {
          htmlElement.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
        }
      });
      
      // Tìm shadow DOM của custom elements nếu có
      if (chatLauncher && (chatLauncher as any).shadowRoot) {
        const shadowRoot = (chatLauncher as any).shadowRoot;
        const shadowElements = shadowRoot.querySelectorAll('*');
        shadowElements.forEach((el: HTMLElement) => {
          if (show) {
            el.style.cssText = '';
          } else {
            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
          }
        });
      }
      if (chatWindow && (chatWindow as any).shadowRoot) {
        const shadowRoot = (chatWindow as any).shadowRoot;
        const shadowElements = shadowRoot.querySelectorAll('*');
        shadowElements.forEach((el: HTMLElement) => {
          if (show) {
            el.style.cssText = '';
          } else {
            el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
          }
        });
      }
    }, 200); // Delay để đảm bảo chatbot script đã load và render
  }

  ngOnDestroy(): void {
    // 🟩 ADDED: Cleanup subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
