
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../shared/product.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <h2>{{editMode ? 'Edit' : 'Add'}} Product</h2>
    <form #f="ngForm">
      <input name="name" [(ngModel)]="model.name" required placeholder="Name">
      <input name="price" [(ngModel)]="model.price" required type="number" placeholder="Price">
      <button (click)="save()" [disabled]="f.invalid">Save</button>
    </form>
  `
})
export class ProductFormComponent {
  model:any = {};
  editMode = false

  constructor(route: ActivatedRoute, private service: ProductService, private router: Router) {
    const id = route.snapshot.params['id'];
    if (id) {
      this.editMode = true
      this.model = { ...this.service.getById(+id) };
    }
  }

  save() {
    if (this.editMode) this.service.update(this.model);
    else this.service.add({ ...this.model, id: Date.now() });
    this.router.navigate(['/products']);
  }
}
