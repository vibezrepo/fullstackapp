import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Product } from '../../core/services/product.service';

@Component({
  standalone: true,
  selector: 'app-product-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  products: Product[] = [];
  searchText = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {
    this.products = this.productService.getProducts();
  }

  get filteredProducts() {
    return this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addProduct() {
    this.router.navigate(['/add']);
  }

  editProduct(id: number) {
    this.router.navigate(['/edit', id]);
  }

  viewDetails(id: number) {
    this.router.navigate(['/details', id]);
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id);
    this.products = this.productService.getProducts();
  }
}
