import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ProductDetailsComponent } from './product-details.component';
import { ProductService } from '../services/product.service';
import { CartService } from '../../cart/services/cart.service';
import { Product } from '../models/product.model';

describe('ProductDetailsComponent', () => {
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let component: ProductDetailsComponent;

  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarOpenSpy: jasmine.Spy;
  let routeStub: { snapshot: { params: { id?: string } } };

  const mockProduct: Product = {
    id: 2,
    name: 'Headphones',
    price: 200,
    category: 'Electronics',
    description: 'Noise cancelling'
  };

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj<ProductService>('ProductService', [
      'getProductById'
    ]);
    cartServiceSpy = jasmine.createSpyObj<CartService>('CartService', ['addToCart']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routeStub = { snapshot: { params: {} } };

    productServiceSpy.getProductById.and.returnValue(of(mockProduct));
    cartServiceSpy.addToCart.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    snackBarOpenSpy = spyOn((component as any).snackBar as MatSnackBar, 'open');
  });

  it('loads product stream when route id exists', () => {
    routeStub.snapshot.params = { id: '2' };

    component.ngOnInit();

    expect(productServiceSpy.getProductById).toHaveBeenCalledWith(2);
    expect(component.product$).toBeDefined();
  });

  it('does nothing when addToCart receives invalid product', () => {
    component.quantity = 1;

    component.addToCart(undefined);

    expect(cartServiceSpy.addToCart).not.toHaveBeenCalled();
  });

  it('does nothing when quantity is less than one', () => {
    component.quantity = 0;

    component.addToCart(mockProduct);

    expect(cartServiceSpy.addToCart).not.toHaveBeenCalled();
  });

  it('adds to cart successfully, resets quantity, and shows snackbar', () => {
    component.quantity = 3;
    cartServiceSpy.addToCart.and.returnValue(of({} as any));

    component.addToCart(mockProduct);

    expect(component.isAddingToCart).toBeFalse();
    expect(component.quantity).toBe(1);
    expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(2, 3);
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Headphones added to cart!', 'Close', {
      duration: 3000
    });
  });

  it('handles add to cart failure and shows error snackbar', () => {
    component.quantity = 2;
    cartServiceSpy.addToCart.and.returnValue(
      throwError(() => new Error('add failed'))
    );

    component.addToCart(mockProduct);

    expect(component.isAddingToCart).toBeFalse();
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Failed to add item to cart', 'Close', {
      duration: 3000
    });
  });

  it('increments quantity by one', () => {
    component.quantity = 1;

    component.incrementQuantity();

    expect(component.quantity).toBe(2);
  });

  it('decrements quantity but never below one', () => {
    component.quantity = 2;
    component.decrementQuantity();
    expect(component.quantity).toBe(1);

    component.decrementQuantity();
    expect(component.quantity).toBe(1);
  });

  it('navigates back to products', () => {
    component.back();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});
