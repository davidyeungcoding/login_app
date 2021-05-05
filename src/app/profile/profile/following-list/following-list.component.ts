import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { User } from 'src/app/interfaces/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.css']
})
export class FollowingListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private profileData: User;
  followingList: boolean;
  endOfFollowingList: boolean;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_profile => this.profileData = _profile));
    this.subscriptions.add(this.profileService.endOfFollowingList.subscribe(_check => this.endOfFollowingList = _check));
    this.subscriptions.add(this.profileService.followingList.subscribe(_list => this.followingList = !!_list.length));
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
