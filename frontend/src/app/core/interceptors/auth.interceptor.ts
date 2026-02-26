import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        }
      });
    }
  }

  return next(req);
};

