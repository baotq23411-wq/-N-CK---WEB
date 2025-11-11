import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


class RoomService {
  search(data: any) {
    console.log('Tìm kiếm với:', data);
  }
}

@Component ({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css',
})

export class RoomList {
  constructor(private http: HttpClient, private router: Router) {}
  rawPackages: any[] = [];
  allPackages: any[] = [];
  originalPackages: any[] = [];

  // ===== Lọc theo giá =====
  minPrice: number = 200000;
  maxPrice: number = 1250000;
  selectedMinPrice: number = this.minPrice;
  selectedMaxPrice: number = this.maxPrice;

  // ===== Các biến tìm kiếm =====
  sortOrder: string = '';
  keywordInput = '';
  checkinDate: string = '';
  guestCountFilter: string = '';
  selectedTags: string[] = [];
  selectedGardens: string[] = [];
  availableTags = ['thiền', 'tĩnh tâm', 'healing', 'trò chuyện', 'chill nhẹ', 'workshop'];
  gardenTags: string[] = ['Oasis', 'Genii', 'Mutiny', 'Catharis'];
  spaceTags: string[] = [
    "Không gian thiền/yên tĩnh",
    "Không gian cá nhân",
    "Không gian riêng tư",
    "Không gian nhóm nhỏ",
    "Không gian nhóm lớn",
    "Không gian học tập/chia sẻ",
    "Không gian thư giãn",
    "Không gian luyện tập",
    "Không gian cân bằng năng lượng",
    "Không gian kết nối",
    "Không gian phục hồi năng lượng",
    "Không gian sáng tạo",
    "Không gian nghệ thuật",
    "Không gian yên tĩnh",
    "Không gian giải trí",
    "Không gian xả stress",
    "Không gian đồng đội",
    "Không gian năng động"
  ];

selectedSpaceTags: string[] = [];

showAllSpaceTags: boolean = false;

get visibleSpaceTags(): string[] {
  return this.showAllSpaceTags ? this.spaceTags : this.spaceTags.slice(0, 5);
}

  goToRoomDetail(roomId: number) {
    this.router.navigate(['/room-detail', roomId]);
  }


  ngOnInit() {
    // 🟩 ADDED: Scroll to top khi vào trang
    window.scrollTo(0, 0);
    
    this.http.get<any[]>('assets/data/rooms.json').subscribe(data => {
      this.rawPackages = data;
      this.originalPackages = [...data];
      this.flattenPackages();
      // 🟩 ADDED: Scroll to top sau khi load dữ liệu (đảm bảo scroll hoạt động)
      setTimeout(() => window.scrollTo(0, 0), 100);
    });
  }

  viewMode: 'horizontal' | 'vertical' = 'vertical';

  setViewMode(mode: 'horizontal' | 'vertical') {
    this.viewMode = mode;
  }

  onFilterRooms() {
    this.allPackages = this.originalPackages.filter(pkg => {
      const matchesTags = this.selectedTags.length === 0 || this.selectedTags.some(tag => pkg.tags.includes(tag));
      const matchesGarden = this.selectedGardens.length === 0 || this.selectedGardens.some(g => pkg.tags.includes(g));
      const guestFilter = parseInt(this.guestCountFilter || '0');
      const [min, max] = this.parseGuestRange(pkg.range);
      const matchesGuestCount = !guestFilter || max >= guestFilter;
      const matchesPrice = pkg.price >= this.selectedMinPrice && pkg.price <= this.selectedMaxPrice;
      const matchesSpace = this.selectedSpaceTags.length === 0 || 
                     this.selectedSpaceTags.some(tag => pkg.tags.includes(tag));


      return matchesTags && matchesGarden && matchesGuestCount && matchesPrice && matchesSpace;
    });
      if (this.sortOrder === 'asc') {
        this.allPackages.sort((a, b) => a.price - b.price);
      } else if (this.sortOrder === 'desc') {
        this.allPackages.sort((a, b) => b.price - a.price);
      }
  }

  resetPrice() {
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.onFilterRooms();
  }


  onSearchRooms() {
    const keyword = this.keywordInput.trim().toLowerCase();

    // Nếu không có từ khóa thì không hiển thị gì hết
    if (!keyword) {
      this.allPackages = [];
      return;
    }

    // Lọc các phòng phù hợp với từ khóa
    this.allPackages = this.originalPackages.filter(pkg => {
      const inRoomName = pkg.room_name.toLowerCase().includes(keyword);
      const inDescription = pkg.description.toLowerCase().includes(keyword);
      const inTags = pkg.tags.some((tag: string) => tag.toLowerCase().includes(keyword));
      const matchesKeyword = keyword === '' || inRoomName || inDescription || inTags;

      const matchesTags = this.selectedTags.length === 0 || this.selectedTags.some(tag => pkg.tags.includes(tag));
      const matchesGarden = this.selectedGardens.length === 0 || this.selectedGardens.some(g => pkg.tags.includes(g));
      const guestFilter = parseInt(this.guestCountFilter || '0');
      const [min, max] = this.parseGuestRange(pkg.range);
      const matchesGuestCount = !guestFilter || max >= guestFilter;
      const matchesPrice = pkg.price >= this.selectedMinPrice && pkg.price <= this.selectedMaxPrice;
      const matchesSpace = this.selectedSpaceTags.length === 0 || this.selectedSpaceTags.some(tag => pkg.tags.includes(tag));

      return matchesKeyword && matchesTags && matchesGarden && matchesGuestCount && matchesPrice && matchesSpace;
    });

  // Áp dụng sắp xếp nếu có
  if (this.sortOrder === 'asc') {
    this.allPackages.sort((a, b) => a.price - b.price);
  } else if (this.sortOrder === 'desc') {
    this.allPackages.sort((a, b) => b.price - a.price);
  }
    // Cuộn xuống kết quả
  setTimeout(() => {
      const resultSection = document.querySelector('.room-list-results');
      resultSection?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }

  flattenPackages() {
    const keyword = this.keywordInput.toLowerCase();
    const maxGuest = parseInt(this.guestCountFilter || '0');

    this.allPackages = this.rawPackages.filter(pkg => {
      const guestMatch = !maxGuest || this.parseMaxGuest(pkg.range) <= maxGuest;
      const tagMatch = this.selectedTags.length === 0 || this.selectedTags.every(tag => pkg.tags.includes(tag));
      const keywordMatch = !this.keywordInput || (
        pkg.room_name.toLowerCase().includes(keyword) ||
        pkg.description.toLowerCase().includes(keyword)
      );
      return guestMatch && tagMatch && keywordMatch;
    });
  }

  parseMaxGuest(range: string): number {
    const match = range.match(/\d+/g);
    if (!match) return 0;
    return parseInt(match[1] || match[0]);
  }

  toggleGarden(garden: string) {
    const index = this.selectedGardens.indexOf(garden);
    if (index > -1) {
      this.selectedGardens.splice(index, 1);  // Bỏ chọn
    } 
    else {
      this.selectedGardens.push(garden);      // Thêm chọn
    }
    this.onFilterRooms();
  }

  toggleAllGardens(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.selectedGardens = [...this.gardenTags]; // Chọn hết
    } 
    else {
      this.selectedGardens = []; // Bỏ hết
    }
    this.onFilterRooms();
  }

  toggleSpaceTag(tag: string): void {
  const index = this.selectedSpaceTags.indexOf(tag);
  if (index > -1) {
    this.selectedSpaceTags.splice(index, 1);
  } else {
    this.selectedSpaceTags.push(tag);
  }
  this.onFilterRooms();
}

  toggleShowAllSpaceTags(): void {
    this.showAllSpaceTags = !this.showAllSpaceTags;
  }


  isAllGardensSelected(): boolean {
    return this.gardenTags.every(tag => this.selectedGardens.includes(tag));
  }
  
  parseGuestRange(range: string): [number, number] {
    const match = range.match(/\d+/g);
    if (!match) return [0, 0];
    if (match.length === 1) return [parseInt(match[0]), parseInt(match[0])];
    return [parseInt(match[0]), parseInt(match[1])];
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('vi-VN') + ' VND';
  }

}
