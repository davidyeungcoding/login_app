import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../interfaces/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-content',
  templateUrl: './profile-content.component.html',
  styleUrls: ['./profile-content.component.css']
})
export class ProfileContentComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private activeList: string;
  private activeTab: string;
  private initialFollowingLoad: boolean;
  private initialFollowerLoad: boolean;
  profileData: User;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.profileService.activeList.subscribe(_list => this.activeList = _list));
    this.subscriptions.add(this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab));
    this.subscriptions.add(this.profileService.initialFollowingLoad.subscribe(_state => this.initialFollowingLoad = _state));
    this.subscriptions.add(this.profileService.initialFollowerLoad.subscribe(_state => this.initialFollowerLoad = _state));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (!this.initialFollowingLoad) this.profileService.changeInitialFollowingLoad(true);
    if (!this.initialFollowerLoad) this.profileService.changeInitialFollowerLoad(true);
  }

  onMakeActive(listId: string, tabId: string): void {
    if (listId !== this.activeList) {
      $(`#${this.activeList}`).addClass('visible');
      $(`#${listId}`).removeClass('visible');
      this.profileService.changeActiveList(listId);
    } if (tabId !== this.activeTab) {
      $(`#${this.activeTab}`).removeClass('active-tab');
      $(`#${tabId}`).addClass('active-tab');
      this.profileService.changeActiveTab(tabId);
    };
  };

  addProfileImage(listId: string, tabId: string): void {
    this.onMakeActive(listId, tabId);

    switch (listId) {
      case 'followingList':
        if (this.initialFollowingLoad) {
          this.profileService.assignProfilePreviewImage($('.following-profile-image'));
          this.profileService.changeInitialFollowingLoad(false);
        };
        break;
      case 'followerList':
        if (this.initialFollowerLoad) {
          this.profileService.assignProfilePreviewImage($('.follower-profile-image'));
          this.profileService.changeInitialFollowerLoad(false);
        };
    };
  };
}
