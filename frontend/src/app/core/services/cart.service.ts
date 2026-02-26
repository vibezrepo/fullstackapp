import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';

interface AddToCartRequest {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl = `${environment.apiUrl}/cart`;
  
  // BehaviorSubject for reactive cart updates with automatic change detection
  private cartSubject = new BehaviorSubject<Cart>({
    id: 0,
    items: [],
    totalPrice: 0
  });

  // Observable stream for components to subscribe to
  public cart$ = this.cartSubject.asObservable();

  // Observable for cart item count
  public cartItemCount$ = this.cart$.pipe(
    tap(cart => {
      // Automatically emits when cart changes
    })
  );

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize cart on service creation only in browser
    this.loadCart();
  }

  /**
   * Load cart from backend - only loads in browser environment
   */
  loadCart(): void {
    // Only load cart in browser environment to avoid SSR issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.http.get<Cart>(this.apiUrl).subscribe({
      next: (cart) => {
        console.log('Cart loaded successfully:', cart);
        this.cartSubject.next(cart);
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        // Check if error is due to authentication
        if (err.status === 401 || err.status === 403) {
          console.warn('Cart requires authentication. User may not be logged in.');
        }
        
        // Initialize with empty cart on error
        this.cartSubject.next({
          id: 0,
          items: [],
          totalPrice: 0
        });
      }
    });
  }

  /**
   * Reload cart from backend
   */
  reloadCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => {
        console.log('Cart reloaded successfully:', cart);
        this.cartSubject.next(cart);
      }),
      tap(
        () => { /* success */ },
        (err) => {
          console.error('Failed to reload cart:', err);
          console.error('Status:', err.status);
          console.error('Message:', err.message);
          
          // Still update with empty cart on error
          this.cartSubject.next({
            id: 0,
            items: [],
            totalPrice: 0
          });
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
    return this.http.post<Cart>(`${this.apiUrl}/add`, request).pipe(
      tap(cart => {
        // Update BehaviorSubject which triggers change detection
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(cartItemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${cartItemId}`).pipe(
      tap(cart => {
        // Update BehaviorSubject which triggers change detection
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Update cart item quantity
   */
  updateQuantity(cartItemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${cartItemId}/quantity`, null, {
      params: { quantity: quantity.toString() }
    }).pipe(
      tap(cart => {
        // Update BehaviorSubject which triggers change detection
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        // Reset cart
        this.cartSubject.next({
          id: 0,
          items: [],
          totalPrice: 0
        });
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

