import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

    this.isBrowser = isPlatformBrowser(this.platformId);

    // ✅ SAFE localStorage access
    if (this.isBrowser) {
      const stored = localStorage.getItem('loggedIn');
      if (stored === 'true') {
        this.authState.next(true);
      }
    }
  }

  login() {
    if (this.isBrowser) {
      localStorage.setItem('loggedIn', 'true');
    }
    this.authState.next(true);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('loggedIn');
    }
    this.authState.next(false);
  }

  isLoggedIn(): boolean {
    return this.authState.value;
  }
}
