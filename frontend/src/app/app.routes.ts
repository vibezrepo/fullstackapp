import { Routes } from '@angular/router';
import { authGuard } from './shared/auth/guards/auth.guard';

import { WelcomeComponent } from './features/welcome/welcome.component';
import { ProductListComponent } from './features/products/ProductListComponent/product-list.component';
import { ProductFormComponent } from './features/products/product-form.component';
import { ProductDetailsComponent } from './features/products/ProductDetailsComponent/product-details.component';
import { CartComponent } from './features/cart/cart.component';
import { LoginComponent } from './shared/authentication/LoginComponent/login.component';
import { RegisterComponent } from './shared/authentication/RegisterComponent/register.component';

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

