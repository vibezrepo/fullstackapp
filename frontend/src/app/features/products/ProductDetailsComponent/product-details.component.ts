import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../services/product.service';
import { CartService } from '../../cart/services/cart.service';
import { Product } from '../models/product.model';

@Component({
  standalone: true,
  selector: 'app-product-details',

  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],

  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailsComponent implements OnInit {

  product$?: Observable<Product>;
  quantity: number = 1;
  isAddingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.product$ = this.productService.getProductById(+id);
    }
  }

  /**
   * Add current product to cart with selected quantity
   * Uses reactive cart service which automatically updates via BehaviorSubject
   */
  addToCart(product: Product | undefined) {
    if (!product || this.quantity < 1) {
      return;
    }

    this.isAddingToCart = true;

    this.cartService.addToCart(product.id, this.quantity).subscribe({
      next: (cart) => {
        this.isAddingToCart = false;
        this.quantity = 1; // Reset quantity
        this.snackBar.open(
          `${product.name} added to cart!`,
          'Close',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.isAddingToCart = false;
        this.snackBar.open(
          'Failed to add item to cart',
          'Close',
          { duration: 3000 }
        );
        console.error('Add to cart error:', error);
      }
    });
  }

  /**
   * Increment quantity
   */
  incrementQuantity() {
    this.quantity++;
  }

  /**
   * Decrement quantity (minimum 1)
   */
  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  back() {
    this.router.navigate(['/products']);
  }
}
