import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../cart/services/cart.service';

export interface OrderSummary {
  id: number;
  userEmail: string;
  paymentMethod: string;
  status?: string;
  pickDate?: string;
  deliveryDate?: string;
  invoiceDate?: string;
  cardLast4?: string;
  cardExpiry?: string;
  address: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  items: Array<{ productName: string; quantity: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = `${environment.apiUrl}/checkout`;

  constructor(
    private http: HttpClient,
    @Inject(CartService) private cartService: CartService
  ) {}

  /**
   * Send checkout request to the server and clear local cart afterwards
   */
  confirmOrder(payload: any = {}): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload).pipe(
      switchMap(res => {
        // refresh/clear cart state locally
        return this.cartService.clearCart().pipe(
          switchMap(() => {
            return new Observable(sub => {
              sub.next(res);
              sub.complete();
            });
          })
        );
      })
    );
  }

  /**
   * Get orders history for current user
   */
  getOrders(): Observable<OrderSummary[]> {
    return this.http.get<OrderSummary[]>(`${this.apiUrl}/orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }
}

