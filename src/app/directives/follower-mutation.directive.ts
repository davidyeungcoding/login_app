import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';

@Directive({
  selector: '[appFollowerMutation]'
})
export class FollowerMutationDirective implements OnInit, AfterViewInit, OnDestroy {
  private followerMutation: MutationObserver | undefined;
  private config = { childList: true };

  constructor(
    private element: ElementRef,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.checkForChanges();
  }

  ngAfterViewInit(): void {
    this.followerMutation.observe(this.element.nativeElement, this.config);
  }

  ngOnDestroy(): void {
    if (this.followerMutation) {
      this.followerMutation.disconnect();
      this.followerMutation = undefined;
    };
  }

  checkForChanges(): void {
    this.followerMutation = new MutationObserver(entry => {
      const target = $('.follower-profile-image');
      const start = target.length - entry.length;
      if (entry && start > 0) this.profileService.assignFollowImage(target, target.length - entry.length);
    });
  };

  clearFollowerMutation(): void {
  };
}
