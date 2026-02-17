
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products$ = new BehaviorSubject([
    { id: 1, name: 'Laptop', price: 50000 },
    { id: 2, name: 'Phone', price: 20000 }
  ]);

  getProducts() { return this.products$.asObservable(); }

  add(product:any) {
    const current = this.products$.value;
    this.products$.next([...current, product]);
  }

  update(product:any) {
    const updated = this.products$.value.map(p => p.id === product.id ? product : p);
    this.products$.next(updated);
  }

  getById(id:number) {
    return this.products$.value.find(p => p.id === id);
  }
}
