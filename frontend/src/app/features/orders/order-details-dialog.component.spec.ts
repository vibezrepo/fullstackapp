import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { OrderDetailsDialogComponent } from './order-details-dialog.component';
import { OrderSummary } from '../checkout/services/checkout.service';

describe('OrderDetailsDialogComponent', () => {
  let fixture: ComponentFixture<OrderDetailsDialogComponent>;
  let component: OrderDetailsDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<OrderDetailsDialogComponent>>;
  let onStatusChangeSpy: jasmine.Spy;

  const mockOrder: OrderSummary = {
    id: 123,
    userEmail: 'test@example.com',
    paymentMethod: 'card',
    status: 'PENDING',
    pickDate: '2026-03-17',
    deliveryDate: '2026-03-18',
    invoiceDate: '2026-03-16',
    cardLast4: '1234',
    cardExpiry: '12/25',
    address: {
      name: 'Jane Doe',
      street: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'USA'
    },
    items: [{ productName: 'Widget', quantity: 2 }]
  };

  beforeEach(async () => {
    onStatusChangeSpy = jasmine.createSpy('onStatusChange');
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [OrderDetailsDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { order: mockOrder, onStatusChange: onStatusChangeSpy } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component and initializes order', () => {
    expect(component).toBeTruthy();
    expect(component.order?.id).toBe(123);
  });

  it('updates order status, calls onStatusChange, and closes dialog', () => {
    component.setStatus('CONFIRMED');
    expect(component.order?.status).toBe('CONFIRMED');
    expect(onStatusChangeSpy).toHaveBeenCalledWith('CONFIRMED');
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('closes dialog when close button clicked', () => {
    const closeButton = fixture.nativeElement.querySelector('button[aria-label="Close"]');
    closeButton.click();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
