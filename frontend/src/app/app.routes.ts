import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { WelcomeComponent } from './features/welcome/welcome.component';
import { ProductListComponent } from './features/products/product-list.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { ProductDetailsComponent } from './features/products/product-details.component';
import { CartComponent } from './features/cart/cart.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'add', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'edit/:id', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'details/:id', component: ProductDetailsComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: '**', component: NotFoundComponent }
];

