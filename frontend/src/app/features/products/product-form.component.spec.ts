import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ProductFormComponent } from './product-form.component';
import { ProductService } from './services/product.service';
import { Product } from './models/product.model';

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeStub: { snapshot: { params: { id?: string } } };

  const mockProduct: Product = {
    id: 5,
    name: 'Phone',
    price: 900,
    category: 'Electronics',
    description: 'Flagship phone'
  };

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj<ProductService>('ProductService', [
      'getProductById',
      'addProduct',
      'updateProduct'
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routeStub = { snapshot: { params: {} } };

    productServiceSpy.addProduct.and.returnValue(of(mockProduct));
    productServiceSpy.updateProduct.and.returnValue(of(mockProduct));
    productServiceSpy.getProductById.and.returnValue(of(mockProduct));

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  });

  it('stays in add mode when route id is missing', () => {
    routeStub.snapshot.params = {};

    component.ngOnInit();

    expect(component.isEdit).toBeFalse();
    expect(productServiceSpy.getProductById).not.toHaveBeenCalled();
  });

  it('loads product and enters edit mode when route id is present', () => {
    routeStub.snapshot.params = { id: '5' };

    component.ngOnInit();

    expect(component.isEdit).toBeTrue();
    expect(productServiceSpy.getProductById).toHaveBeenCalledWith(5);
    expect(component.productForm.value.name).toBe('Phone');
  });

  it('does not save when form is invalid', () => {
    component.productForm.patchValue({
      name: '',
      price: 0,
      category: '',
      description: ''
    });

    component.save();

    expect(productServiceSpy.addProduct).not.toHaveBeenCalled();
    expect(productServiceSpy.updateProduct).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('adds product and navigates to products in add mode', () => {
    component.isEdit = false;
    component.productForm.patchValue(mockProduct);

    component.save();

    expect(productServiceSpy.addProduct).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 5, name: 'Phone' })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('updates product and navigates to products in edit mode', () => {
    component.isEdit = true;
    component.productForm.patchValue(mockProduct);

    component.save();

    expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 5, name: 'Phone' })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('navigates back to products on cancel', () => {
    component.cancel();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
  });
});
