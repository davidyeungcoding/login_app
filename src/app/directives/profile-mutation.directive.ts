import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';

import { Subscription } from 'rxjs';
import { User } from '../interfaces/user';

@Directive({
  selector: '[appProfileMutation]'
})
export class ProfileMutationDirective implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private profileMutation: MutationObserver | undefined;
  private config = {attributes: true, childList: true};
  private profileData: User;

  constructor(
    private element: ElementRef,
    private profileService: ProfileService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkForChanges();
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
  }

  ngAfterViewInit(): void {
    this.profileMutation.observe(this.element.nativeElement, this.config);
  }

  ngOnDestroy(): void {
    if (this.profileMutation) {
      this.profileMutation.disconnect();
      this.profileMutation = undefined;
    };
    this.subscriptions.unsubscribe();
  }

  assignProfileImage(): void {
    console.log('||||||||||||assignProfileImage()||||||||||||')
    const image = this.profileService.convertBufferToString(this.profileData.profileImage.data);
    const type = this.profileData.profileImageType;
    this.profileService.assignPostProfileImage(image, type, $('.personal-profile-image'));
  };

  checkForChanges(): void {
    this.profileMutation = new MutationObserver(entry => {
      console.log('<<<<<Mutation Here>>>>>')
      console.log(entry)
      if (entry && this.profileData.profileImage) this.assignProfileImage();
    });
  };
}
