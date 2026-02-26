import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './app-table.component.html',
  styleUrls: ['./app-table.component.scss']
})
export class AppTableComponent {

  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  // allow parent to hide the actions column when not needed
  @Input() showActions: boolean = true;

  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() addToCart = new EventEmitter<any>();

  get displayedColumns(): string[] {
    const cols = [...this.columns.map(c => c.key)];
    if (this.showActions) {
      cols.push('actions');
    }
    return cols;
  }
}
