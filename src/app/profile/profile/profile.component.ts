import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';

import { ActivatedRoute } from '@angular/router';
import { User } from '../../interfaces/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private isEditing: boolean;
  private currentUser: any;
  isFollowing: boolean;
  profileData: User;
  isVisiting: boolean;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(user => this.profileData = user));
    this.subscriptions.add(this.profileService.changeActiveList('postList'));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    this.subscriptions.add(this.profileService.isFollowing.subscribe(_state => this.isFollowing = _state));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.authService.isVisiting.subscribe(_state => this.isVisiting = _state));
    
    if (!this.profileData.username
      || this.profileData.username !== this.route.snapshot.paramMap.get('username')) this.getProfileData();
    }
    
  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getProfileData(): void {
    let username = this.route.snapshot.paramMap.get('username');
    this.authService.handleRedirectProfile(username, this.isEditing, false);
  };

  onMoveToTop(): void {
    document.documentElement.scrollTop = 0;
  };

// ===============
// || Following ||
// ===============

  handleFollowAction(): void {
    if (this.authService.visitingProfile(this.currentUser, this.profileData) && !this.authService.isExpired()) {
      const payload = this.authService.followerPayload(this.currentUser, this.profileData);
      this.isFollowing ? this.authService.onUnfollow(payload, this.profileData, this.isEditing)
      : this.authService.onFollow(payload, this.profileData, this.isEditing);
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    } else if (!localStorage.getItem('id_token')) {
      this.authService.followError('You must be logged in before following.', false, this.currentUser.username, this.isEditing);
    };
  };
}
