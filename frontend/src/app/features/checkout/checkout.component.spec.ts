import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { CheckoutComponent } from './checkout.component';
import { FormBuilder } from '@angular/forms';
import { CartService } from '../cart/services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { Cart, CartItem } from '../cart/models/cart.model';

describe('CheckoutComponent', () => {
  let fixture: ComponentFixture<CheckoutComponent>;
  let component: CheckoutComponent;
  let fb: FormBuilder;

  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let checkoutServiceSpy: jasmine.SpyObj<CheckoutService>;
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
      'reloadCart'
    ]);
    checkoutServiceSpy = jasmine.createSpyObj<CheckoutService>('CheckoutService', [
      'confirmOrder'
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    cartServiceSpy.getCart$.and.returnValue(of(mockCart));
    cartServiceSpy.reloadCart.and.returnValue(of(mockCart));
    checkoutServiceSpy.confirmOrder.and.returnValue(of({ message: 'ok' }));

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: CheckoutService, useValue: checkoutServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    snackBarOpenSpy = spyOn((component as any).snackBar as MatSnackBar, 'open');
  });

  it('creates component with forms and reloads cart', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(cartServiceSpy.reloadCart).toHaveBeenCalled();
    expect(component.errorMessage).toBe('');
    expect(component.addressForm).toBeDefined();
    expect(component.paymentForm).toBeDefined();
  });

  it('navigates to products after successful order with payload', () => {
    component.addressForm = fb.group({
      name: ['John'], street: ['X'], city: ['C'], state: ['S'], zip: ['123'], country: ['Country']
    });
    component.paymentForm = fb.group({ method: ['cod'] });

    component.confirmOrder();
    expect(checkoutServiceSpy.confirmOrder).toHaveBeenCalledWith({
      address: component.addressForm.value,
      paymentMethod: 'cod'
    });
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Order placed successfully', 'Close', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
  it('shows error snackbar when checkout fails', () => {
    checkoutServiceSpy.confirmOrder.and.returnValue(throwError(() => new Error('fail')));

    // make sure forms exist before calling confirmOrder
    component.ngOnInit();

    component.confirmOrder();
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Failed to place order', 'Close', { duration: 3000 });
  });

  it('goToProducts navigates to products page', () => {
    component.goToProducts();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('goBackToCart navigates to cart page', () => {
    component.goBackToCart();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cart']);
  });
});