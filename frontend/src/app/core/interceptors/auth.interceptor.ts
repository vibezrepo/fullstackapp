import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`
      }
    });
  }

  return next(req);
};
