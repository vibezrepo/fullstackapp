
import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome.component';
import { ProductListComponent } from './pages/product-list.component';
import { ProductFormComponent } from './pages/product-form.component';
import { ProductDetailsComponent } from './pages/product-details.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'add', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'edit/:id', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'details/:id', component: ProductDetailsComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
