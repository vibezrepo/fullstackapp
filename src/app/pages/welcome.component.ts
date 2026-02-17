
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  template: `<h2>Welcome Page</h2>`
})
export class WelcomeComponent implements OnInit {
  ngOnInit() {
    console.log('Lifecycle Hook: Welcome Init');
  }
}
