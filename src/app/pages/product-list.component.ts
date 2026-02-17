
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../shared/product.service';
import { SearchPipe } from '../shared/search.pipe';
import { HighlightDirective } from '../shared/highlight.directive';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchPipe, HighlightDirective],
  template: `
    <h2>Product List</h2>
    <input [(ngModel)]="term" placeholder="Search">
    <ul>
      <li *ngFor="let p of products | search:term" highlight>
        {{p.name}} - {{p.price}}
        <button [routerLink]="['/details', p.id]">View</button>
        <button [routerLink]="['/edit', p.id]">Edit</button>
      </li>
    </ul>
    <button routerLink="/add">Add Product</button>
  `
})
export class ProductListComponent {
  term = '';
  products:any[] = [];

  constructor(service: ProductService) {
    service.getProducts().subscribe(p => this.products = p);
  }
}
