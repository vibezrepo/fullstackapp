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
    const cartWithItem: Cart = {
      id: 1,
      items: [{ id: 1, productId: 2, productName: 'Test', productPrice: 5, quantity: 1, subtotal: 5 }],
      totalPrice: 5
    } as any;
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
    const addedCart: Cart = {
      id: 1,
      items: [{ id: 5, productId: 42, productName: 'X', productPrice: 10, quantity: 2, subtotal: 20 }],
      totalPrice: 20
    } as any;
    addReq.flush(addedCart);
    expect(service.getCartItemCount()).toBe(2);

    // now respond to the earlier reload (stale)
    reloadReq.flush({ id: 1, items: [], totalPrice: 0 } as any);
    expect(service.getCartItemCount()).toBe(2); // still correct
  });

  it('loadCart sets empty cart on server error', () => {
    service['cartSubject'].next({
      id: 9,
      items: [{ id: 1, productId: 1, productName: 'A', productPrice: 1, quantity: 1, subtotal: 1 }],
      totalPrice: 1
    });
    service.loadCart();
    const req = httpMock.expectOne(apiUrl);
    req.flush({ message: 'bad' }, { status: 401, statusText: 'Unauthorized' });
    expect(service.getCart()).toEqual({ id: 0, items: [], totalPrice: 0 });
  });

  it('removeFromCart should send delete and update cart', () => {
    const fakeCart: Cart = { id: 2, items: [], totalPrice: 0 } as any;
    service.removeFromCart(33).subscribe(cart => expect(cart).toEqual(fakeCart));
    const req = httpMock.expectOne(`${apiUrl}/items/33`);
    expect(req.request.method).toBe('DELETE');
    req.flush(fakeCart);
    expect(service.getCart()).toEqual(fakeCart);
  });

  it('updateQuantity should PUT and emit new cart', () => {
    const fakeCart: Cart = { id: 3, items: [], totalPrice: 0 } as any;
    service.updateQuantity(12, 7).subscribe(cart => expect(cart).toEqual(fakeCart));
    const req = httpMock.expectOne(`${apiUrl}/items/12/quantity?quantity=7`);
    expect(req.request.method).toBe('PUT');
    req.flush(fakeCart);
    expect(service.getCart()).toEqual(fakeCart);
  });

  it('clearCart resets the subject and returns void', () => {
    service['cartSubject'].next({
      id: 5,
      items: [{ id: 1, productId: 1, productName: 'A', productPrice: 1, quantity: 1, subtotal: 1 }],
      totalPrice: 1
    });
    service.clearCart().subscribe(() => {
      expect(service.getCart()).toEqual({ id: 0, items: [], totalPrice: 0 });
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getCart$ returns observable stream', done => {
    let sub: any;
    sub = service.getCart$().subscribe(c => {
      expect(c).toBeDefined();
      sub.unsubscribe();
      done();
    });
  });

  it('synchronous getters reflect current state', () => {
    // set custom cart
    const cart: Cart = {
      id: 10,
      items: [{ id: 1, productId: 2, productName: 'B', productPrice: 4, quantity: 3, subtotal: 12 }],
      totalPrice: 12
    } as any;
    service['cartSubject'].next(cart);
    expect(service.getCart()).toEqual(cart);
    expect(service.getCartItemCount()).toBe(3);
    expect(service.getTotalPrice()).toBe(12);
  });

});
