import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../cart/services/cart.service';

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
}
