import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

import { AuthService, LoginRequest, AuthResponse } from './auth.service';
import { environment } from '../../../../environments/environment';

// helper to simulate browser platform
const browserId = 'browser';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: browserId }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // ensure localStorage is clean
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created and initial auth state is false', () => {
    expect(service).toBeTruthy();
    service.authState$.subscribe(state => expect(state).toBe(false));
  });

  it('login should post credentials and return response', () => {
    const creds: LoginRequest = { username: 'u', password: 'p' };
    const resp: AuthResponse = { token: 't', username: 'u' };

    service.login(creds).subscribe(r => expect(r).toEqual(resp));

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(creds);
    req.flush(resp);
  });

  it('register should post data', () => {
    const data = { foo: 'bar' };
    service.register(data).subscribe(r => expect(r).toEqual(data));

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush(data);
  });

  it('saveToken should store token and update auth state', () => {
    spyOn(localStorage, 'setItem').and.callThrough();
    let observed = false;
    service.authState$.subscribe(v => observed = v);

    service.saveToken('abc');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc');
    expect(observed).toBe(true);
    expect(service.getToken()).toBe('abc');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout should remove token and update state', () => {
    localStorage.setItem('token', 'xyz');
    let observed = false;
    service.authState$.subscribe(v => observed = v);

    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(observed).toBe(false);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('getToken returns null on server/platform not browser', () => {
    // temporarily simulate non-browser
    const otherService = new AuthService(TestBed.inject(HttpTestingController) as any, 'server');
    expect(otherService.getToken()).toBeNull();
  });
});