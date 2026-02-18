import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../core/services/product.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent {

  productForm: any;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.productForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
      description: ['', Validators.required]
    });

    const id = this.route.snapshot.params['id'];

    if (id) {
      this.isEdit = true;
      const product = this.productService.getProductById(+id);
      if (product) {
        this.productForm.patchValue(product);
      }
    }
  }

  save() {

    if (this.productForm.invalid) return;

    const product = this.productForm.value;

    if (this.isEdit) {
      this.productService.updateProduct(product);
    } else {
      product.id = Date.now();
      this.productService.addProduct(product);
    }

    this.router.navigate(['/products']);
  }
}
