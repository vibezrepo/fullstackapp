import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../auth/services/auth.service';
import { CartService } from '../../../features/cart/services/cart.service';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { MatBadge } from '@angular/material/badge';

// simple stubs
class FakeAuthService {
  private authSub = new BehaviorSubject<boolean>(false);
  authState$ = this.authSub.asObservable();
  logout() {
    this.authSub.next(false);
  }
  setLoggedIn(value: boolean) {
    this.authSub.next(value);
  }
}

class FakeCartService {
  private cartSub = new BehaviorSubject<any>({ items: [] });
  getCart$() { return this.cartSub.asObservable(); }
  setCart(cart: any) { this.cartSub.next(cart); }
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let auth: FakeAuthService;
  let cart: FakeCartService;
  let router: Router;

  beforeEach(async () => {
    auth = new FakeAuthService();
    cart = new FakeCartService();

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: CartService, useValue: cart }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows login/register when not logged in', () => {
    auth.setLoggedIn(false);
    fixture.detectChanges();
    const login = fixture.debugElement.query(By.css('button[routerLink="/login"]'));
    const register = fixture.debugElement.query(By.css('button[routerLink="/register"]'));
    expect(login).toBeTruthy();
    expect(register).toBeTruthy();
  });

  it('shows other links and cart when logged in', () => {
    auth.setLoggedIn(true);
    cart.setCart({ items: [{ quantity: 2 }] });
    fixture.detectChanges();
    // run another cycle to ensure async pipe has emitted
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('button[routerLink="/products"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('button[routerLink="/cart"]'))).toBeTruthy();

    // inspect the MatBadge directive instance rather than DOM element
    const badgeDebug = fixture.debugElement.query(By.directive(MatBadge));
    expect(badgeDebug).toBeTruthy();
    const badgeInst = badgeDebug.injector.get(MatBadge);
    expect(badgeInst.content).toBe('2');
  });

  it('getCartItemCount handles undefined or null or empty arrays', () => {
    expect(component.getCartItemCount(null)).toBe(0);
    expect(component.getCartItemCount(undefined)).toBe(0);
    expect(component.getCartItemCount({})).toBe(0);
    expect(component.getCartItemCount({ items: [] })).toBe(0);
    expect(component.getCartItemCount({ items: [{ quantity: 1 }] })).toBe(1);
    expect(component.getCartItemCount({ items: [{ quantity: 2 }, { quantity: 3 }] })).toBe(5);
  });

  it('logout triggers auth.logout and navigates', () => {
    const spy = spyOn(auth, 'logout').and.callThrough();
    const navSpy = spyOn(router, 'navigate');

    // ensure auth state is true then logout should clear it
    auth.setLoggedIn(true);
    component.logout();

    expect(spy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/login']);
    // auth state stream should have emitted false
    auth.authState$.subscribe(v => expect(v).toBe(false));
  });
});