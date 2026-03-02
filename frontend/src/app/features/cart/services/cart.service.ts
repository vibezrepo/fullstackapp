import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, distinctUntilChanged } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Cart } from '../models/cart.model';
import { AuthService } from '../../../shared/auth/services/auth.service';

interface AddToCartRequest {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl = `${environment.apiUrl}/cart`;

  private cartVersion = 0;

  private bumpVersion(): number {
    return ++this.cartVersion;
  }

  private cartSubject = new BehaviorSubject<Cart>({
    id: 0,
    items: [],
    totalPrice: 0
  });

  public cart$ = this.cartSubject.asObservable();

  public cartItemCount$ = this.cart$.pipe(
    tap(cart => {
      // Automatically emits when cart changes
    })
  );

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {
    this.authService.authState$
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(isLoggedIn => {
        if (isLoggedIn) {

          this.reloadCart().subscribe({
            error: err => {
              console.error('Error reloading cart after login', err);
            }
          });
        } else {
          this.cartSubject.next({
            id: 0,
            items: [],
            totalPrice: 0
          });
        }
      });
  }

  loadCart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const ver = this.bumpVersion();

    this.http.get<Cart>(this.apiUrl).subscribe({
      next: (cart) => {
        console.log('Cart loaded successfully:', cart);
        if (ver === this.cartVersion) {
          this.cartSubject.next(cart);
        } else {
          console.log('stale loadCart response ignored');
        }
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        if (err.status === 401 || err.status === 403) {
          console.warn('Cart requires authentication. User may not be logged in.');
        }
        
        // Initialize with empty cart on error
        if (ver === this.cartVersion) {
          this.cartSubject.next({
            id: 0,
            items: [],
            totalPrice: 0
          });
        }
      }
    });
  }

  reloadCart(): Observable<Cart> {
    const ver = this.bumpVersion();
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => {
        console.log('Cart reloaded successfully:', cart);
        if (ver === this.cartVersion) {
          this.cartSubject.next(cart);
        } else {
          console.log('stale reloadCart response ignored');
        }
      }),
      tap(
        () => { /* success */ },
        (err) => {
          console.error('Failed to reload cart:', err);
          console.error('Status:', err.status);
          console.error('Message:', err.message);
          
          // Still update with empty cart on error
          if (ver === this.cartVersion) {
            this.cartSubject.next({
              id: 0,
              items: [],
              totalPrice: 0
            });
          }
        }
      )
    );
  }

  /**
   * Get current cart value (synchronous)
   */
  getCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Get cart as observable (for async pipe in templates)
   */
  getCart$(): Observable<Cart> {
    return this.cart$;
  }

  /**
   * Add product to cart with automatic change detection
   */
  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    const request: AddToCartRequest = { productId, quantity };
    const ver = this.bumpVersion();
    return this.http.post<Cart>(`${this.apiUrl}/add`, request).pipe(
      tap(cart => {
        // only update if this response is not stale
        if (ver === this.cartVersion) {
          this.cartSubject.next(cart);
        }
      })
    );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(cartItemId: number): Observable<Cart> {
    const ver = this.bumpVersion();
    return this.http.delete<Cart>(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(cart => {
        if (ver === this.cartVersion) {
          this.cartSubject.next(cart);
        }
      })
    );
  }

  /**
   * Update cart item quantity
   */
  updateQuantity(cartItemId: number, quantity: number): Observable<Cart> {
    const ver = this.bumpVersion();
    return this.http.put<Cart>(`${this.apiUrl}/items/${cartItemId}/quantity`, null, {
      params: { quantity: quantity.toString() }
    }).pipe(
      tap(cart => {
        if (ver === this.cartVersion) {
          this.cartSubject.next(cart);
        }
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<void> {
    const ver = this.bumpVersion();
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        if (ver === this.cartVersion) {
          // Reset cart
          this.cartSubject.next({
            id: 0,
            items: [],
            totalPrice: 0
          });
        }
      })
    );
  }

  /**
   * Get total cart items count
   */
  getCartItemCount(): number {
    return this.cartSubject.value.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get total price
   */
  getTotalPrice(): number {
    return this.cartSubject.value.totalPrice;
  }
}

