import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppTableComponent } from '../../shared/components/app-table/app-table.component';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AppTableComponent,
    MatSnackBarModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchText = '';
  isLoading = false;
  errorMessage = '';

  columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'category', label: 'Category' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('API DATA →', data);
          this.products = data;
          this.filteredProducts = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          this.errorMessage = 'Failed to load products. Please try again.';
          this.isLoading = false;
        }
      });
  }


  search(): void {
    this.filteredProducts = this.products.filter(p =>
      p.name?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      p.price?.toString().includes(this.searchText.toLowerCase()) ||
      p.category?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  addProduct(): void {
    this.router.navigate(['/add']);
  }

  onView(product: Product): void {
    this.router.navigate(['/details', product.id]);
  }

  onEdit(product: Product): void {
    this.router.navigate(['/edit', product.id]);
  }

  onDelete(product: Product): void {
    this.productService.deleteProduct(product.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.errorMessage = 'Failed to delete product. Please try again.';
        }
      });
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open(`${product.name} added to cart`, 'Close', { duration: 2500 });
      },
      error: (err) => {
        console.error('Add to cart failed', err);
        this.snackBar.open('Failed to add to cart', 'Close', { duration: 2500 });
      }
    });
  }
}
