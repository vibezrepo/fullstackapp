import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  // reactive auth state for components to observe
  private authSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authSubject.asObservable();

  constructor(private http: HttpClient,@Inject(PLATFORM_ID) private platformId: Object) {
    // initialize auth state based on existing token (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      this.authSubject.next(!!token);
    }
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
      this.authSubject.next(true);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
  
  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.authSubject.next(false);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
