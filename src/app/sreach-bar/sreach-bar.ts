import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-sreach-bar',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './sreach-bar.html',
  styleUrls: ['./sreach-bar.css']
})
export class SreachBarComponent {

  // Tabs
  activeTab: 'book' | 'guide' = 'book';
  isActive(tab: string){ return this.activeTab === tab as any; }
  setTab(tab:'book'|'guide'){ this.activeTab = tab; }

  // Filters
  zones = [
    {key:'an-nhien', label:'An Nhiên'},     // thiền / yoga / massage
    {key:'tam-hon', label:'Tâm Hồn'},       // tham vấn / journaling
    {key:'cam-hung', label:'Cảm Hứng'},     // vẽ / âm nhạc
    {key:'cach-mang', label:'Cách Mạng'}    // game / hoạt động mạnh
  ];
  servicesMap: Record<string,string[]> = {
    'an-nhien' : ['Thiền định', 'Yoga Flow', 'Massage Thảo mộc'],
    'tam-hon'  : ['Tham vấn 1:1', 'Viết nhật ký có hướng dẫn'],
    'cam-hung' : ['Workshop Vẽ', 'Phòng Âm nhạc'],
    'cach-mang': ['VR Game', 'Thử thách thể lực']
  };

  zone = 'an-nhien';
  service = this.servicesMap['an-nhien'][0];
  date: string = '';
  time: string = '';
  promo: string = '';

  // Guests dropdown
  isDropdownOpen = false;
  guests = 1;
  get guestsText(){ return `${this.guests} người`; }
  toggleDropdown(){ this.isDropdownOpen = !this.isDropdownOpen; }
  changeGuests(delta:number){
    this.guests = Math.max(1, Math.min(10, this.guests + delta));
  }

  // Sync service when zone changes
  onZoneChange(){
    const list = this.servicesMap[this.zone] || [];
    if (!list.includes(this.service)) this.service = list[0] ?? '';
  }

  onSearch(){
    // TODO: replace with real navigation/query
    console.log({
      zone: this.zone, service: this.service, date: this.date,
      time: this.time, guests: this.guests, promo: this.promo
    });
    alert('Đã tìm phiên phù hợp cho bạn! (console xem payload)');
  }
}
