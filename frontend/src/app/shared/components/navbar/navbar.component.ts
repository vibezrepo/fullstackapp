import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatBadgeModule,
    RouterLink
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Angular</span>
      <span class="spacer"></span>

      <button mat-button routerLink="/" *ngIf="isLoggedIn$ | async">Home</button>

      <button mat-button routerLink="/products" *ngIf="isLoggedIn$ | async">
        Products
      </button>

      <button mat-button routerLink="/" *ngIf="isLoggedIn$ | async">
        About
      </button>

      <!-- Cart Icon with Badge -->
      <button 
        mat-icon-button 
        routerLink="/cart" 
        *ngIf="isLoggedIn$ | async"
        [matBadge]="getCartItemCount(cart$ | async)"
        matBadgeColor="warn"
        [matBadgeHidden]="getCartItemCount(cart$ | async) === 0"
        matTooltip="Shopping Cart"
      >
        <mat-icon>shopping_cart</mat-icon>
      </button>

      <button mat-button routerLink="/login" *ngIf="!(isLoggedIn$ | async)">
        Sign In
      </button>

      <button mat-button routerLink="/register" *ngIf="!(isLoggedIn$ | async)">
        Register
      </button>

      <button mat-button color="warn" *ngIf="isLoggedIn$ | async" (click)="logout()">
        Logout
      </button>
    </mat-toolbar>
  `,
  styles: [`.spacer { flex: 1; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {

  cart$;
  isLoggedIn$;

  constructor(
    public auth: AuthService, 
    private cartService: CartService,
    private router: Router
  ) {
    this.cart$ = this.cartService.getCart$();
    this.isLoggedIn$ = this.auth.authState$;
  }

  /**
   * Get cart item count for badge display
   */
  getCartItemCount(cart: any): number {
    return cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
