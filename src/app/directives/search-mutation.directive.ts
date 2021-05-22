import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';
import { SearchService } from '../services/search.service';

@Directive({
  selector: '[appSearchMutation]'
})
export class SearchMutationDirective implements OnInit, AfterViewInit, OnDestroy {
  private searchMutation: MutationObserver | undefined;
  private config = { subtree: true, childList: true };
  private step: number;

  constructor(
    private element: ElementRef,
    private profileService: ProfileService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
    this.checkForChanges();
    this.searchService.step.subscribe(_step => this.step = _step);
  }

  ngAfterViewInit(): void {
    this.searchMutation.observe(this.element.nativeElement, this.config);
  }

  ngOnDestroy(): void {
    if (this.searchMutation) {
      this.searchMutation.disconnect();
      this.searchMutation = undefined;
    };
  }

  checkForChanges(): void {
    this.searchMutation = new MutationObserver(entry => {
      const target = $('.search-profile-image');

      if (target.length) {
        const start = target.length <= this.step ? 0
        : target.length % this.step ? Math.floor(target.length / this.step) * this.step
        : (Math.floor(target.length / this.step) - 1) * this.step;
        
        if (entry.length === 1 && entry[0].removedNodes.length) return;
        this.profileService.assignProfilePreviewImage(target, start);
      }
    });
  };
}
