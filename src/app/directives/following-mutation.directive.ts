import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';

@Directive({
  selector: '[appFollowingMutation]'
})
export class FollowingMutationDirective implements OnInit, AfterViewInit, OnDestroy {
  private followingMutation: MutationObserver | undefined;
  private config = { childList: true };

  constructor(
    private element: ElementRef,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.checkForChanges();
  }

  ngAfterViewInit(): void {
    this.followingMutation.observe(this.element.nativeElement, this.config);
  }

  ngOnDestroy(): void {
    if (this.followingMutation) {
      this.followingMutation.disconnect();
      this.followingMutation = undefined;
    };
  }

  checkForChanges(): void {
    this.followingMutation = new MutationObserver(entry => {
      const target = $('.following-profile-image');
      const start = target.length - entry.length;
      if (entry && start > 0) this.profileService.assignProfilePreviewImage(target, start);
    });
  };
}
