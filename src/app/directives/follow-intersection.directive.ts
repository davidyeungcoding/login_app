import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appFollowIntersection]'
})
export class FollowIntersectionDirective implements OnInit, AfterViewInit, OnDestroy {
  private followObserver: IntersectionObserver | undefined;

  constructor(
    private element: ElementRef
  ) { }

  ngOnInit(): void {
    this.checkVisibility();
  }

  ngAfterViewInit(): void {
    this.followObserver.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.followObserver) {
      this.followObserver.disconnect();
      this.followObserver = undefined;
    };
  }

  checkVisibility(): void {
    this.followObserver = new IntersectionObserver(entry => {
      if (entry[0].intersectionRatio === 0) {
        $('#followBtn').css('display', 'inline');
      } else if (entry[0].intersectionRatio > 0) {
        $('#followBtn').css('display', 'none');
      };
    });
  };
}
