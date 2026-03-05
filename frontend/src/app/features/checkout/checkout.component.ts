import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

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
      country: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      method: ['cod', Validators.required]
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
    const payload = {
      address: this.addressForm.value,
      paymentMethod: this.paymentForm.value.method
    } as any;

    this.checkoutService.confirmOrder(payload).subscribe({
      next: () => {
        this.snackBar.open('Order placed successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.snackBar.open('Failed to place order', 'Close', { duration: 3000 });
      }
    });
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
