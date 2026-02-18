import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  standalone: true,
  imports: [MatCardModule, MatListModule],
  template: `
    <div class="center">
      <mat-card class="card">

        <h2>About This Application</h2>

        <p>
          This Angular 19 demonstrates modern Angular architecture & concepts.
        </p>

        <mat-list>
          <mat-list-item>✔ Angular Standalone Components</mat-list-item>
          <mat-list-item>✔ Lifecycle Hooks</mat-list-item>
          <mat-list-item>✔ Custom Pipes & Directives</mat-list-item>
          <mat-list-item>✔ State Management</mat-list-item>
          <mat-list-item>✔ Shared Services</mat-list-item>
          <mat-list-item>✔ Route Guards</mat-list-item>
          <mat-list-item>✔ Material Design UI</mat-list-item>
        </mat-list>

      </mat-card>
    </div>
  `,
  styles: [`
    .center {
      display: flex;
      justify-content: center;
      margin-top: 40px;
    }

    .card {
      width: 600px;
      padding: 25px;
    }
  `]
})
export class WelcomeComponent {}
