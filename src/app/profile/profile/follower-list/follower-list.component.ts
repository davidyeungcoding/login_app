import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { User } from 'src/app/interfaces/user';
import { ProfilePreview } from 'src/app/interfaces/profile-preview';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-follower-list',
  templateUrl: './follower-list.component.html',
  styleUrls: ['./follower-list.component.css']
})
export class FollowerListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  profileData: User;
  followerList: ProfilePreview[];

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_profile => this.profileData = _profile));
    this.subscriptions.add(this.profileService.followerList.subscribe(_list => this.followerList = _list));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username);
    this.profileService.resetVisible('followerList');
    this.profileService.resetActiveTab('followerTab');
  };
}
