import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';

import { AppTableComponent } from './app-table.component';

describe('AppTableComponent', () => {
  let component: AppTableComponent;
  let fixture: ComponentFixture<AppTableComponent>;

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ];

  const data = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppTableComponent,
        BrowserAnimationsModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppTableComponent);
    component = fixture.componentInstance;
    component.columns = columns;
    component.data = data;
    component.showActions = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes displayedColumns including actions when showActions=true', () => {
    expect(component.displayedColumns).toEqual(['id', 'name', 'actions']);
  });

  it('computes displayedColumns without actions when showActions=false', () => {
    component.showActions = false;
    expect(component.displayedColumns).toEqual(['id', 'name']);
  });

  it('renders header cells for each column', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    // debug HTML
    console.log(fixture.nativeElement.innerHTML);
    const headers = fixture.nativeElement.querySelectorAll('th[mat-header-cell]');
    expect(headers.length).toBe(3); // id, name, actions
    expect(headers[0].textContent.trim()).toBe('ID');
    expect(headers[1].textContent.trim()).toBe('Name');
    expect(headers[2].textContent.trim()).toBe('Actions');
  });

  it('emits view event when view button clicked', async () => {
    spyOn(component.view, 'emit');
    fixture.detectChanges();
    await fixture.whenStable();
    const firstRow = fixture.debugElement.queryAll(By.css('tr[mat-row]'))[0];
    const viewBtn = firstRow.query(By.css('button[mat-icon-button][color="primary"]'))!;
    viewBtn.triggerEventHandler('click', null);
    expect(component.view.emit).toHaveBeenCalledWith(data[0]);
  });

  it('emits edit event when edit button clicked', async () => {
    spyOn(component.edit, 'emit');
    fixture.detectChanges();
    await fixture.whenStable();
    const firstRow = fixture.debugElement.queryAll(By.css('tr[mat-row]'))[0];
    const editBtn = firstRow.query(By.css('button[mat-icon-button][color="accent"]'))!;
    editBtn.triggerEventHandler('click', null);
    expect(component.edit.emit).toHaveBeenCalledWith(data[0]);
  });

  it('emits delete event when delete button clicked', async () => {
    spyOn(component.delete, 'emit');
    fixture.detectChanges();
    await fixture.whenStable();
    const firstRow = fixture.debugElement.queryAll(By.css('tr[mat-row]'))[0];
    const deleteBtn = firstRow.queryAll(By.css('button[mat-icon-button][color="warn"]'))[0];
    deleteBtn.triggerEventHandler('click', null);
    expect(component.delete.emit).toHaveBeenCalledWith(data[0]);
  });

  it('emits addToCart event when add to cart button clicked', async () => {
    spyOn(component.addToCart, 'emit');
    fixture.detectChanges();
    await fixture.whenStable();
    const firstRow = fixture.debugElement.queryAll(By.css('tr[mat-row]'))[0];
    const cartBtn = firstRow.query(By.css('button[mat-icon-button][matTooltip="Add to cart"]'));
    cartBtn!.triggerEventHandler('click', null);
    expect(component.addToCart.emit).toHaveBeenCalledWith(data[0]);
  });
});
