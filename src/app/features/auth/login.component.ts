import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';
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

        <h2>Sign In</h2>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Username</mat-label>
          <input matInput [(ngModel)]="username" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input matInput type="password" [(ngModel)]="password" required>
        </mat-form-field>

        <div class="error" *ngIf="showError">
          Please enter username & password
        </div>

        <button mat-raised-button color="primary" class="full" (click)="login()">
          Login
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
export class LoginComponent {

  username = '';
  password = '';
  showError = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.showError = true;
      return;
    }

    this.showError = false;
    this.auth.login();
    this.router.navigate(['/products']);
  }
}
