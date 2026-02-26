import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CartService } from '../../core/services/cart.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { AppTableComponent } from '../../shared/components/app-table/app-table.component';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    AppTableComponent
  ],
  template: `
    <div class="cart-container">
      <mat-card class="cart-card">
        <h2>Shopping Cart</h2>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="(cart$ | async) as cart">
          <!-- Empty Cart Message -->
          <div *ngIf="!cart.items || cart.items.length === 0" class="empty-cart">
            <p>Your cart is empty</p>
            <button mat-raised-button color="primary" (click)="continueShopping()">
              Continue Shopping
            </button>
          </div>

          <!-- Cart Items Table - Using Shared App Table Component -->
          <div *ngIf="cart.items && cart.items.length > 0" class="cart-content">
            <app-table 
              [columns]="tableColumns" 
              [data]="cart.items"
              [showActions]="false"
            ></app-table>

            <!-- Cart Summary -->
            <div class="cart-summary">
              <div class="summary-row">
                <span class="summary-label">Total Items:</span>
                <span class="summary-value">{{ getCartItemCount(cart) }}</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">Total Price:</span>
                <span class="summary-value">₹ {{ cart.totalPrice | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button 
                mat-raised-button 
                color="primary"
                class="checkout-btn"
              >
                Proceed to Checkout
              </button>
              <button 
                mat-stroked-button 
                (click)="continueShopping()"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .cart-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .cart-card {
      padding: 28px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    h2 {
      margin: 0 0 24px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid #c62828;

      mat-icon {
        flex-shrink: 0;
      }
    }

    .empty-cart {
      text-align: center;
      padding: 40px 20px;

      p {
        font-size: 16px;
        color: #999;
        margin-bottom: 20px;
      }
    }

    .cart-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cart-summary {
      background-color: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;

      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;

        &.total {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-top: 1px solid #ddd;
          padding-top: 12px;
          margin-top: 12px;
        }
      }

      .summary-label {
        color: #666;
      }

      .summary-value {
        font-weight: 500;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      button {
        flex: 1;
        min-width: 140px;
        height: 40px;

        &.checkout-btn {
          min-width: 200px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent implements OnInit {

  cart$;
  errorMessage = '';
  tableColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'productPrice', label: 'Price' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'subtotal', label: 'Subtotal' }
  ];

  constructor(
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cart$ = this.cartService.getCart$();
  }

  ngOnInit(): void {
    // Reload cart when component initializes
    this.cartService.reloadCart().subscribe({
      next: (cart) => {
        console.log('Cart data:', cart);
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Please log in to view your cart';
          this.snackBar.open('Please log in first', 'Close', { duration: 5000 });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Make sure backend is running on http://localhost:8080';
        } else {
          this.errorMessage = 'Error loading cart: ' + (err.message || 'Unknown error');
        }
      }
    });
  }

  /**
   * Get total item count from cart
   */
  getCartItemCount(cart: any): number {
    return cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }

  /**
   * Increment item quantity
   */
  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1).subscribe({
      error: () => this.snackBar.open('Failed to update quantity', 'Close', { duration: 3000 })
    });
  }

  /**
   * Decrement item quantity
   */
  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1).subscribe({
        error: () => this.snackBar.open('Failed to update quantity', 'Close', { duration: 3000 })
      });
    }
  }

  /**
   * Remove item from cart
   */
  removeItem(cartItemId: number): void {
    this.cartService.removeFromCart(cartItemId).subscribe({
      next: () => {
        this.snackBar.open('Item removed from cart', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to remove item', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.snackBar.open('Cart cleared', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to clear cart', 'Close', { duration: 3000 });
        }
      });
    }
  }

  /**
   * Navigate to products page
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
