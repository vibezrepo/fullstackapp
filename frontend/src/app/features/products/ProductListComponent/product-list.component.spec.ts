import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../services/product.service';
import { CartService } from '../../cart/services/cart.service';
import { Product } from '../models/product.model';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;

  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarOpenSpy: jasmine.Spy;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Laptop',
      price: 1200,
      category: 'Electronics',
      description: 'Gaming laptop'
    },
    {
      id: 2,
      name: 'Notebook',
      price: 10,
      category: 'Stationery',
      description: 'College notebook'
    }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj<ProductService>('ProductService', [
      'getProducts',
      'deleteProduct'
    ]);
    cartServiceSpy = jasmine.createSpyObj<CartService>('CartService', ['addToCart']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    productServiceSpy.getProducts.and.returnValue(of([]));
    cartServiceSpy.addToCart.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    snackBarOpenSpy = spyOn((component as any).snackBar as MatSnackBar, 'open');
  });

  it('loads products on init', () => {
    productServiceSpy.getProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(productServiceSpy.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
    expect(component.filteredProducts).toEqual(mockProducts);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('sets error state when loading products fails', () => {
    productServiceSpy.getProducts.and.returnValue(
      throwError(() => new Error('network issue'))
    );

    component.loadProducts();

    expect(component.products).toEqual([]);
    expect(component.filteredProducts).toEqual([]);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to load products. Please try again.');
  });

  it('filters products by name, price, and category', () => {
    component.products = mockProducts;

    component.searchText = 'lap';
    component.search();
    expect(component.filteredProducts.map((p) => p.id)).toEqual([1]);

    component.searchText = '10';
    component.search();
    expect(component.filteredProducts.map((p) => p.id)).toEqual([2]);

    component.searchText = 'electronics';
    component.search();
    expect(component.filteredProducts.map((p) => p.id)).toEqual([1]);
  });

  it('navigates correctly for add, view, and edit actions', () => {
    component.addProduct();
    component.onView(mockProducts[0]);
    component.onEdit(mockProducts[1]);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/add']);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/details', 1]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/edit', 2]);
  });

  it('deletes product and reloads list on success', () => {
    productServiceSpy.deleteProduct.and.returnValue(of(void 0));
    const loadSpy = spyOn(component, 'loadProducts');

    component.onDelete(mockProducts[0]);

    expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(1);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('sets error message when delete fails', () => {
    productServiceSpy.deleteProduct.and.returnValue(
      throwError(() => new Error('delete failed'))
    );

    component.onDelete(mockProducts[0]);

    expect(component.errorMessage).toBe('Failed to delete product. Please try again.');
  });

  it('adds item to cart and shows success snackbar', () => {
    cartServiceSpy.addToCart.and.returnValue(of({} as any));

    component.onAddToCart(mockProducts[0]);

    expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(1, 1);
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Laptop added to cart', 'Close', {
      duration: 2500
    });
  });

  it('shows failure snackbar when add to cart fails', () => {
    cartServiceSpy.addToCart.and.returnValue(
      throwError(() => new Error('cart failed'))
    );

    component.onAddToCart(mockProducts[0]);

    expect(snackBarOpenSpy).toHaveBeenCalledWith('Failed to add to cart', 'Close', {
      duration: 2500
    });
  });
});
