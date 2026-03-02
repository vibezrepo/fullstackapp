import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

import { CartService } from './cart.service';
import { AuthService } from '../../../shared/auth/services/auth.service';
import { Cart } from '../models/cart.model';
import { environment } from '../../../../environments/environment';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/cart`;

  beforeEach(() => {
    const authStub = { authState$: of(true) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authStub }
      ]
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);

    
    const initial = httpMock.match(apiUrl);
    initial.forEach(req => req.flush({ id: 0, items: [], totalPrice: 0 } as any));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load cart on login (authState=true) and ignore stale responses', () => {
    // two successive reloads: second resolves first
    service.reloadCart().subscribe();
    service.reloadCart().subscribe();

    const [req1, req2] = httpMock.match(apiUrl);

    // reply to second request first with a cart containing one item
    const cartWithItem: Cart = { id: 1, items: [{ id: 1, productId: 2, quantity: 1, price: 5 }], totalPrice: 5 } as any;
    req2.flush(cartWithItem);
    expect(service.getCartItemCount()).toBe(1);

    // now respond to the first (stale) request with an empty cart
    const emptyCart: Cart = { id: 1, items: [], totalPrice: 0 } as any;
    req1.flush(emptyCart);

    // the stale response must NOT override the later value
    expect(service.getCartItemCount()).toBe(1);
  });

  it('addToCart bumps version so a concurrent reload cannot overwrite it', () => {
    // start a reload, then addToCart
    service.reloadCart().subscribe();
    const reloadReq = httpMock.expectOne(apiUrl);

    // now call addToCart before responding to reload
    service.addToCart(42, 2).subscribe();
    const addReq = httpMock.expectOne(`${apiUrl}/add`);

    // respond to add request with cart having one entry
    const addedCart: Cart = { id: 1, items: [{ id: 5, productId: 42, quantity: 2, price: 10 }], totalPrice: 20 } as any;
    addReq.flush(addedCart);
    expect(service.getCartItemCount()).toBe(2);

    // now respond to the earlier reload (stale)
    reloadReq.flush({ id: 1, items: [], totalPrice: 0 } as any);
    expect(service.getCartItemCount()).toBe(2); // still correct
  });
});
