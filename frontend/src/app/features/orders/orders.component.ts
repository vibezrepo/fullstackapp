import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';

import { CheckoutService, OrderSummary } from '../checkout/services/checkout.service';
import { AppTableComponent } from '../../shared/components/app-table/app-table.component';
import { OrderDetailsDialogComponent } from './order-details-dialog.component';

@Component({
  standalone: true,
  selector: 'app-orders',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    AppTableComponent,
    OrderDetailsDialogComponent
  ],
  template: `
    <div class="orders-container">
      <mat-card class="orders-card">
        <h2>My Orders</h2>

        <!-- keep OrderDetailsDialogComponent referenced so Angular compiler knows it's used -->
        <app-order-details-dialog
          *ngIf="false"
          [order]="null"
          [onStatusChange]="noop"
        ></app-order-details-dialog>

        <div *ngIf="error" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ error }}</span>
        </div>

        <div *ngIf="(orders$ | async) as orders">
          <div *ngIf="orders.length === 0" class="empty">
            <p>You have no orders yet.</p>
            <button mat-raised-button color="primary" (click)="goToProducts()">
              Browse Products
            </button>
          </div>

          <div *ngIf="orders.length > 0">
            <app-table
              [columns]="columns"
              [data]="orders"
              [showActions]="false"
              [cellTemplates]="{
                items: itemsCell,
                actions: actionsCell,
                status: statusCell
              }"
            ></app-table>

            <ng-template #itemsCell let-order>
              {{ order.items?.length || 0 }}
            </ng-template>

            <ng-template #statusCell let-order>
              <span class="status" [ngClass]="statusClass(order)">
                {{ order.status || 'PENDING' }}
              </span>
            </ng-template>

            <ng-template #actionsCell let-order>
              <div class="action-buttons">
                <button mat-icon-button matTooltip="View" (click)="openOrderDialog(order)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button
                  mat-icon-button
                  matTooltip="Confirm order"
                  (click)="confirmOrder(order)"
                  [disabled]="(order.status || 'PENDING') === 'CONFIRMED'"
                >
                  <mat-icon>check_circle</mat-icon>
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .orders-card {
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .order-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-top: 18px;
    }

    .order-card {
      padding: 18px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .order-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
    }

    .order-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 18px;
      margin-bottom: 16px;
    }

    .order-block h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.8);
    }

    .secondary {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .empty {
      text-align: center;
      padding: 32px 0;
    }

    .status {
      font-weight: 600;
    }

    .status.pending {
      color: #f57c00;
    }

    .status.confirmed {
      color: #2e7d32;
    }

    .status.out_for_delivery {
      color: #1976d2;
    }

    .status.out_of_stock {
      color: #d32f2f;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid #c62828;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit {
  orders$!: Observable<OrderSummary[]>;
  error = '';

  noop(status: string): void {}

  columns = [
    { key: 'id', label: 'Order #' },
    { key: 'invoiceDate', label: 'Invoice' },
    { key: 'pickDate', label: 'Pick' },
    { key: 'deliveryDate', label: 'Delivery' },
    { key: 'status', label: 'Status' },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'items', label: 'Items' },
    { key: 'actions', label: 'Actions' }
  ];

  constructor(
    private checkoutService: CheckoutService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refreshOrders();
  }

  refreshOrders(): void {
    this.orders$ = this.checkoutService.getOrders();
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  openOrderDialog(order: OrderSummary): void {
    const dialogRef = this.dialog.open(OrderDetailsDialogComponent, {
      data: {
        order,
        onStatusChange: (status: string) => this.setOrderStatus(order, status)
      }
    });

    // Refresh order list once the dialog closes (regardless of action taken)
    dialogRef.afterClosed().subscribe(() => this.refreshOrders());
  }

  confirmOrder(order: OrderSummary): void {
    this.setOrderStatus(order, 'CONFIRMED');
  }

  statusClass(order: OrderSummary): string {
    const value = (order.status || 'PENDING').toLowerCase().replace(/\s+/g, '_');
    return value;
  }

  private setOrderStatus(order: OrderSummary, status: string): void {
    this.checkoutService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Order updated to ${status}`, 'Close', { duration: 3000 });
        this.refreshOrders();
      },
      error: (err) => {
        this.snackBar.open('Failed to update order status', 'Close', { duration: 3000 });
        console.error('Order status update failed', err);
      }
    });
  }
}
