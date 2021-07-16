import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRecentActivityMutation]'
})
export class RecentActivityMutationDirective implements OnInit, AfterViewInit, OnDestroy {
  private activityMutation: MutationObserver | undefined;
  private config = {attributes: false, childList: true};

  constructor(
    private element: ElementRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkForChanges();
  }

  ngAfterViewInit(): void {
    this.activityMutation.observe(this.element.nativeElement, this.config);
    this.addClickEvent();
  }

  ngOnDestroy(): void {
    if (this.activityMutation) {
      this.activityMutation.disconnect;
      this.activityMutation = undefined;
    };
  }

  addClickEvent(): void {
    const elements = document.getElementsByClassName('on-click');
    if (!elements.length) return;

    Array.from(elements).forEach(elem => {
      const username = elem.attributes[1].value;
      elem.addEventListener('click', () => {
        this.authService.handleRedirectProfile(username, true);
      });
      elem.classList.add('on-click-parse');
      elem.classList.remove('on-click');
    });
  };

  checkForChanges() {
    this.activityMutation = new MutationObserver(entry => {
      if (entry && entry.length) this.addClickEvent();
    });
  };
}
