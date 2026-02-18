import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], term: string) {
    if (!term) return items;
    return items.filter(i =>
      i.name.toLowerCase().includes(term.toLowerCase())
    );
  }
}
