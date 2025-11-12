import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/** Kiểu dữ liệu tài khoản dùng trong app */
export interface Account {
  id: number;
  ho_ten: string;
  email: string;
  phone_number?: string;
  diem_tich_luy: number;   // dùng tính hạng
  diem_kha_dung: number;   // điểm hiện có
}

/** LocalStorage keys */
const LS_TOKEN_KEY = 'panacea_token';
const LS_ACC_KEY   = 'panacea_account';
const LS_UID_KEY   = 'UID';

@Injectable({ providedIn: 'root' })
export class AuthService {
