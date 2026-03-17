import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { OrdersComponent } from './orders.component';
import { CheckoutService, OrderSummary } from '../checkout/services/checkout.service';

describe('OrdersComponent', () => {
  let fixture: ComponentFixture<OrdersComponent>;
  let component: OrdersComponent;

  let checkoutServiceSpy: jasmine.SpyObj<CheckoutService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<any>>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  const mockOrder: OrderSummary = {
    id: 42,
    userEmail: 'test@example.com',
    paymentMethod: 'cod',
    status: 'PENDING',
    address: {},
    items: []
  };

  beforeEach(async () => {
    checkoutServiceSpy = jasmine.createSpyObj('CheckoutService', ['getOrders', 'updateOrderStatus']);
    checkoutServiceSpy.getOrders.and.returnValue(of([]));
    checkoutServiceSpy.updateOrderStatus.and.returnValue(of({ status: 'CONFIRMED' }));

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(dialogRefSpy);

    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [
        { provide: CheckoutService, useValue: checkoutServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
      .overrideProvider(MatDialog, { useValue: dialogSpy })
      .compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads orders on init', () => {
    expect(checkoutServiceSpy.getOrders).toHaveBeenCalled();
  });

  it('opens dialog and refreshes orders when dialog closes', () => {
    component.openOrderDialog(mockOrder);

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(checkoutServiceSpy.getOrders).toHaveBeenCalledTimes(2); // init + after close
  });
});
