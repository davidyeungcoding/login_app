import { Component, OnDestroy, OnInit } from '@angular/core';

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
export class ProfileComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private isEditing: boolean;
  profileData: User;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(user => this.profileData = user));
    this.subscriptions.add(this.profileService.changeActiveList('postList'));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    if (!this.profileData.username
      || this.profileData.username !== this.route.snapshot.paramMap.get('username')) this.getProfileData();
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
}
