import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ProductService } from './services/product.service';
import { Product } from './models/product.model';

@Component({
  standalone: true,
  selector: 'app-product-form',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule
  ],

  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: any;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    

  this.productForm = this.fb.group({
    id: [null as number | null],
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    description: ['', Validators.required]
  });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.isEdit = true;

      this.productService.getProductById(+id).subscribe(product => {
        this.productForm.patchValue(product);
      });
    }
  }

  save() {
    if (this.productForm.invalid) return;

    const product = this.productForm.value as Product;

    if (this.isEdit) {
      this.productService.updateProduct(product).subscribe(() => {
        this.router.navigate(['/products']);
      });
    } else {
      this.productService.addProduct(product).subscribe(() => {
        this.router.navigate(['/products']);
      });
    }
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}
