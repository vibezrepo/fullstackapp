
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../shared/product.service';

@Component({
  standalone: true,
  template: `
    <h2>Product Details</h2>
    <div *ngIf="product">
      Name: {{product.name}} <br>
      Price: {{product.price}}
    </div>
  `
})
export class ProductDetailsComponent {
  product:any;

  constructor(route: ActivatedRoute, service: ProductService) {
    const id = +route.snapshot.params['id'];
    this.product = service.getById(id);
  }
}
