import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  standalone: true,
  selector: 'app-product-details',

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],

  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  product?: Product;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.productService.getProductById(+id).subscribe(data => {
        this.product = data;
      });
    }
  }

  back() {
    this.router.navigate(['/products']);
  }
}
