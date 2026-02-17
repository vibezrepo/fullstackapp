import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterLink, CommonModule],
  template: `
    <mat-toolbar color="primary">
      <span>Angular 19 POC</span>
      <span class="spacer"></span>

      <button mat-button routerLink="/">Home</button>

      <button mat-button routerLink="/products" *ngIf="auth.isLoggedIn()">
        Products
      </button>

      <button mat-button routerLink="/about">
        About
      </button>

      <button mat-button routerLink="/login" *ngIf="!auth.isLoggedIn()">
        Sign In
      </button>

      <button mat-button routerLink="/register" *ngIf="!auth.isLoggedIn()">
        Register
      </button>

      <button mat-button color="warn" *ngIf="auth.isLoggedIn()" (click)="logout()">
        Logout
      </button>
    </mat-toolbar>
  `,
  styles: [`.spacer { flex: 1; }`]
})
export class NavbarComponent {

  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
