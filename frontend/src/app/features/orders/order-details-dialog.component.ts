import { Component, Inject, Input, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OrderSummary } from '../checkout/services/checkout.service';

export interface OrderDetailsDialogData {
  order: OrderSummary | null;
  onStatusChange: (status: string) => void;
}

@Component({
  standalone: true,
  selector: 'app-order-details-dialog',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css'],
})
export class OrderDetailsDialogComponent {
  @Input() order: OrderSummary | null = null;
  @Input() onStatusChange: (status: string) => void = () => {};

  constructor(
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: OrderDetailsDialogData
  ) {
    if (data) {
      this.order = data.order;
      this.onStatusChange = data.onStatusChange;
    }
  }

  setStatus(status: string): void {
    // update UI immediately and then notify parent component
    if (this.order) {
      this.order.status = status;
    }
    this.onStatusChange(status);
    this.dialogRef.close();
  }
}
