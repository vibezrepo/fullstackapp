import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { environment } from '../../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProducts should return a list', () => {
    const dummy: Product[] = [
      { id: 1, name: 'A', price: 10, category: 'c', description: 'd' }
    ];

    service.getProducts().subscribe(prods => {
      expect(prods).toEqual(dummy);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummy);
  });

  it('getProductById should return single product', () => {
    const prod: Product = { id: 5, name: 'B', price: 20, category: 'x', description: 'y' };

    service.getProductById(5).subscribe(p => {
      expect(p).toEqual(prod);
    });

    const req = httpMock.expectOne(`${apiUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(prod);
  });

  it('addProduct should POST and return new product', () => {
    const newProd: Product = { id: 0, name: 'C', price: 30, category: 'z', description: '' };

    service.addProduct(newProd).subscribe(p => {
      expect(p).toEqual(newProd);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProd);
    req.flush(newProd);
  });

  it('updateProduct should PUT to correct url', () => {
    const upd: Product = { id: 2, name: 'D', price: 40, category: 'k', description: 'l' };

    service.updateProduct(upd).subscribe(p => {
      expect(p).toEqual(upd);
    });

    const req = httpMock.expectOne(`${apiUrl}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(upd);
    req.flush(upd);
  });

  it('deleteProduct should DELETE to correct url', () => {
    service.deleteProduct(3).subscribe(res => {
      // HttpClient will emit null for void responses from the backend
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/3`);
    expect(req.request.method).toBe('DELETE');
    // server responds with no content
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
