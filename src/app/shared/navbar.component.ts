
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav>
      <a routerLink="">Home</a>
      <a routerLink="products" *ngIf="auth.isLoggedIn()">Products</a>
      <a routerLink="login" *ngIf="!auth.isLoggedIn()">Sign In</a>
      <a routerLink="register" *ngIf="!auth.isLoggedIn()">Register</a>
      <button (click)="logout()" *ngIf="auth.isLoggedIn()">Logout</button>
    </nav>
  `,
  styles: [`nav { display:flex; gap:15px; margin-bottom:20px; }`]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
