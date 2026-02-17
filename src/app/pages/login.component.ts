
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Login</h2>
    <form #f="ngForm">
      <input name="user" ngModel required placeholder="Username">
      <input name="pass" ngModel required type="password" placeholder="Password">
      <button (click)="login()" [disabled]="f.invalid">Login</button>
    </form>
  `
})
export class LoginComponent {
  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login();
    this.router.navigate(['/products']);
  }
}
