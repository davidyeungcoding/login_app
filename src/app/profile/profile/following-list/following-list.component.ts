import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { User } from 'src/app/interfaces/user';
import { ProfilePreview } from 'src/app/interfaces/profile-preview';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.css']
})
export class FollowingListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  profileData: User;
  followingList: ProfilePreview[];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_profile => this.profileData = _profile));
    this.subscriptions.add(this.profileService.followingList.subscribe(_list => this.followingList = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username);
    this.profileService.resetVisible('followingList');
    this.profileService.resetActiveTab('followingTab');
  };
}
