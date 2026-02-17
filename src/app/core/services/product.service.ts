import { Injectable } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {

  private products: Product[] = [
    { id: 1, name: 'Laptop', price: 55000, category: 'Electronics', description: 'High performance laptop' },
    { id: 2, name: 'Phone', price: 25000, category: 'Electronics', description: 'Latest smartphone' }
  ];

  getProducts() {
    return this.products;
  }

  getProductById(id: number) {
    return this.products.find(p => p.id === id);
  }

  addProduct(product: Product) {
    this.products.push(product);
  }

  updateProduct(updated: Product) {
    const index = this.products.findIndex(p => p.id === updated.id);
    if (index !== -1) this.products[index] = updated;
  }

  deleteProduct(id: number) {
    this.products = this.products.filter(p => p.id !== id);
  }
}
