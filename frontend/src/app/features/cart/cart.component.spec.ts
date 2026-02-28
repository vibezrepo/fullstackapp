import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { CartComponent } from './cart.component';
import { CartService } from './services/cart.service';
import { Cart, CartItem } from './models/cart.model';

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let component: CartComponent;

  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarOpenSpy: jasmine.Spy;

  const mockItem: CartItem = {
    id: 11,
    productId: 2,
    productName: 'Headphones',
    productPrice: 200,
    quantity: 2,
    subtotal: 400
  };

  const mockCart: Cart = {
    id: 1,
    items: [mockItem],
    totalPrice: 400
  };

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj<CartService>('CartService', [
      'getCart$',
      'reloadCart',
      'updateQuantity',
      'removeFromCart',
      'clearCart'
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    cartServiceSpy.getCart$.and.returnValue(of(mockCart));
    cartServiceSpy.reloadCart.and.returnValue(of(mockCart));
    cartServiceSpy.updateQuantity.and.returnValue(of(mockCart));
    cartServiceSpy.removeFromCart.and.returnValue(of(mockCart));
    cartServiceSpy.clearCart.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    snackBarOpenSpy = spyOn((component as any).snackBar as MatSnackBar, 'open');
  });

  it('creates component and reloads cart on init', () => {
    component.ngOnInit();

    expect(component).toBeTruthy();
    expect(cartServiceSpy.reloadCart).toHaveBeenCalled();
    expect(component.errorMessage).toBe('');
  });

  it('handles unauthorized cart load error and redirects to login', fakeAsync(() => {
    cartServiceSpy.reloadCart.and.returnValue(throwError(() => ({ status: 401 })));

    component.ngOnInit();

    expect(component.errorMessage).toBe('Please log in to view your cart');
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Please log in first', 'Close', {
      duration: 5000
    });

    tick(2000);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('handles backend unavailable error on init', () => {
    cartServiceSpy.reloadCart.and.returnValue(throwError(() => ({ status: 0 })));

    component.ngOnInit();

    expect(component.errorMessage).toContain('Unable to connect to server');
  });

  it('returns total cart item count correctly', () => {
    const count = component.getCartItemCount({
      items: [
        { quantity: 1 },
        { quantity: 3 }
      ]
    });

    expect(count).toBe(4);
    expect(component.getCartItemCount(null)).toBe(0);
  });

  it('increments item quantity', () => {
    component.incrementQuantity(mockItem);

    expect(cartServiceSpy.updateQuantity).toHaveBeenCalledWith(11, 3);
  });

  it('shows snackbar when increment fails', () => {
    cartServiceSpy.updateQuantity.and.returnValue(throwError(() => new Error('failed')));

    component.incrementQuantity(mockItem);

    expect(snackBarOpenSpy).toHaveBeenCalledWith('Failed to update quantity', 'Close', {
      duration: 3000
    });
  });

  it('decrements quantity when greater than one', () => {
    component.decrementQuantity(mockItem);

    expect(cartServiceSpy.updateQuantity).toHaveBeenCalledWith(11, 1);
  });

  it('does not decrement quantity when already one', () => {
    component.decrementQuantity({ ...mockItem, quantity: 1 });

    expect(cartServiceSpy.updateQuantity).not.toHaveBeenCalled();
  });

  it('removes item and shows success snackbar', () => {
    component.removeItem(11);

    expect(cartServiceSpy.removeFromCart).toHaveBeenCalledWith(11);
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Item removed from cart', 'Close', {
      duration: 3000
    });
  });

  it('shows snackbar when remove fails', () => {
    cartServiceSpy.removeFromCart.and.returnValue(throwError(() => new Error('failed')));

    component.removeItem(11);

    expect(snackBarOpenSpy).toHaveBeenCalledWith('Failed to remove item', 'Close', {
      duration: 3000
    });
  });

  it('clears cart when user confirms', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.clearCart();

    expect(cartServiceSpy.clearCart).toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Cart cleared', 'Close', {
      duration: 3000
    });
  });

  it('does not clear cart when user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.clearCart();

    expect(cartServiceSpy.clearCart).not.toHaveBeenCalled();
  });

  it('shows snackbar when clear cart fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    cartServiceSpy.clearCart.and.returnValue(throwError(() => new Error('failed')));

    component.clearCart();

    expect(snackBarOpenSpy).toHaveBeenCalledWith('Failed to clear cart', 'Close', {
      duration: 3000
    });
  });

  it('navigates to products on continue shopping', () => {
    component.continueShopping();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});
