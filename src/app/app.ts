import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Sao } from './sao/sao';
import { Xu } from './xu/xu';
import { Exchange } from './exchange/exchange'; 
import { Payment } from './payment/payment';
import { Star } from './star/star';
import { Coin } from './coin/coin';
import { Banking } from './banking/banking';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterModule, Sao, Xu, Exchange, Payment, Star, Coin, Banking],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('panacea');
}
