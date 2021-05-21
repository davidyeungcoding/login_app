import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';

@Directive({
  selector: '[appSearchMutation]'
})
export class SearchMutationDirective implements OnInit, AfterViewInit, OnDestroy {
  private searchMutation: MutationObserver | undefined;
  private config = { childList: true };

  constructor(
    private element: ElementRef,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.checkForChanges();
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
      const start = target.length - entry.length;
      console.log('==============Mutation Here==============')
      console.log(entry)
      console.log(`target: ${target.length} || entry: ${entry.length} || start: ${start}`)
      // if (entry && start > 0) this.profileService.assignProfilePreviewImage(target, start);
      this.profileService.assignProfilePreviewImage(target, start);
    });
  };
}
