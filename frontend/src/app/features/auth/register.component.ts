import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="center">
      <mat-card class="card">

        <h2>Create Account</h2>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="email" required email>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input matInput type="password" [(ngModel)]="password" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Confirm Password</mat-label>
          <input matInput type="password" [(ngModel)]="confirmPassword" required>
        </mat-form-field>

        <div class="error" *ngIf="showError">
          {{errorMessage}}
        </div>

        <button mat-raised-button color="primary" class="full" (click)="register()">
          Register
        </button>

      </mat-card>
    </div>
  `,
  styles: [`
    .center {
      display: flex;
      justify-content: center;
      margin-top: 60px;
    }

    .card {
      width: 400px;
      padding: 20px;
    }

    .full {
      width: 100%;
      margin-bottom: 15px;
    }

    .error {
      color: red;
      margin-bottom: 10px;
    }
  `]
})
export class RegisterComponent {

  email = '';
  password = '';
  confirmPassword = '';

  showError = false;
  errorMessage = '';

  register() {

    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      this.showError = true;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.showError = true;
      return;
    }

    this.showError = false;
    alert('Registration Successful ✅');
  }
}
