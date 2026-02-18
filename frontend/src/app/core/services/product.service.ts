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
    { id: 2, name: 'Phone', price: 25000, category: 'Electronics', description: 'Latest smartphone' },
    { id: 3, name: 'Tablet', price: 35000, category: 'Electronics', description: 'Powerful tablet' },
    { id: 4, name: 'Camera', price: 45000, category: 'Electronics', description: 'High-quality camera' },
    { id: 5, name: 'Monitor', price: 85000, category: 'Electronics', description: 'High-resolution monitor' }
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
