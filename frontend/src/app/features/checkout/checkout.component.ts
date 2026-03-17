import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CartService } from '../cart/services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { Cart } from '../cart/models/cart.model';
import { AppTableComponent } from '../../shared/components/app-table/app-table.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    AppTableComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent implements OnInit {
  cart$: Observable<Cart>;
  errorMessage = '';

  // limit date pickers to today or earlier
  maxDate = new Date();

  // invoice date is assigned after successful order placement
  invoiceDate?: string;

  addressForm!: FormGroup;
  paymentForm!: FormGroup;

  tableColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'productPrice', label: 'Price' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'subtotal', label: 'Subtotal' }
  ];

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.cart$ = this.cartService.getCart$();
  }

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      country: ['', Validators.required],
      pickDate: [null, this.noFutureDateValidator(this.maxDate)],
      deliveryDate: [null, this.noFutureDateValidator(this.maxDate)]
    });

    this.paymentForm = this.fb.group({
      method: ['cod', Validators.required],
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: ['']
    });

    // require card fields only when payment method is card
    this.paymentForm.get('method')?.valueChanges.subscribe(m => {
      const num = this.paymentForm.get('cardNumber');
      const exp = this.paymentForm.get('cardExpiry');
      const cvv = this.paymentForm.get('cardCvv');
      if (m === 'card') {
        num?.setValidators([Validators.required]);
        exp?.setValidators([Validators.required]);
        cvv?.setValidators([Validators.required]);
      } else {
        num?.clearValidators();
        exp?.clearValidators();
        cvv?.clearValidators();
      }
      num?.updateValueAndValidity();
      exp?.updateValueAndValidity();
      cvv?.updateValueAndValidity();
    });

    this.cartService.reloadCart().subscribe({
      next: () => {
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.snackBar.open('Please log in first', 'Close', { duration: 5000 });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        }else {
          this.errorMessage = 'Error loading cart: ' + (err.message || 'Unknown error');
        }
      }
    });
  }

  confirmOrder(): void {
    // build payload from forms and cart data
    const payload: any = {
      address: this.addressForm.value,
      paymentMethod: this.paymentForm.value.method
    };

    const pickDate: Date | null = this.addressForm.value.pickDate;
    if (pickDate) {
      payload.pickDate = this.formatDate(pickDate);
    }
    const deliveryDate: Date | null = this.addressForm.value.deliveryDate;
    if (deliveryDate) {
      payload.deliveryDate = this.formatDate(deliveryDate);
    }

    // include card details if needed
    if (payload.paymentMethod === 'card') {
      payload.card = {
        number: this.paymentForm.value.cardNumber,
        expiry: this.paymentForm.value.cardExpiry,
        cvv: this.paymentForm.value.cardCvv
      };
    }

    this.checkoutService.confirmOrder(payload).subscribe({
      next: (res: any) => {
        const invoice = res?.invoiceDate;
        const message = invoice
          ? `Order placed successfully (Invoice: ${invoice})`
          : 'Order placed successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.invoiceDate = invoice;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.snackBar.open('Failed to place order', 'Close', { duration: 3000 });
      }
    });
  }

  private noFutureDateValidator(max: Date): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const value = control.value instanceof Date ? control.value : new Date(control.value);
      return value > max ? { futureDate: true } : null;
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Routes for auxiliary buttons
   */
  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }
}
