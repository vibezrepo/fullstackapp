
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>Register</h2>
    <form #f="ngForm">
      <input name="email" ngModel required email placeholder="Email">
      <input name="pass" ngModel required type="password" placeholder="Password">
      <button [disabled]="f.invalid">Register</button>
    </form>
  `
})
export class RegisterComponent {}
