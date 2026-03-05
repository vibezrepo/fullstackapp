import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { CheckoutService } from './checkout.service';
import { CartService } from '../../cart/services/cart.service';
import { of } from 'rxjs';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let httpMock: HttpTestingController;
  let cartServiceSpy: jasmine.SpyObj<CartService>;

  beforeEach(() => {
    cartServiceSpy = jasmine.createSpyObj<CartService>('CartService', ['clearCart']);
    cartServiceSpy.clearCart.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: CartService, useValue: cartServiceSpy }
      ]
    });

    service = TestBed.inject(CheckoutService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should send POST to /checkout with payload and clear cart', () => {
    const dummyPayload = { address: { city: 'Test' }, paymentMethod: 'cod' };
    service.confirmOrder(dummyPayload).subscribe(res => {
      expect(res).toEqual({ message: 'ok' });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/checkout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dummyPayload);
    req.flush({ message: 'ok' });

    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
    httpMock.verify();
  });
});