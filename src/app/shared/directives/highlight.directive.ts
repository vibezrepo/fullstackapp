import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[highlight]',
  standalone: true
})
export class HighlightDirective {

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onEnter() {
    this.el.nativeElement.style.background = '#f5f5f5';
  }

  @HostListener('mouseleave')
  onLeave() {
    this.el.nativeElement.style.background = '';
  }
}
