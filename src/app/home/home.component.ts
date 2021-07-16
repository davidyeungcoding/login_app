import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private isEditing: boolean;
  currentUser: any = this.authService.currentUser;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.currentUser.subscribe(_currentUser => this.currentUser = _currentUser));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser) this.authService.handleRedirectProfile(localUser.username, this.isEditing);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onLoginSubmit(loginForm: NgForm) {
    this.authService.authenticateUser(loginForm.value).subscribe(data => {
      if (data.success) {
        this.profileService.updateListImage(data.profile.recentActivity);
        this.profileService.changeRecentActivity(data.profile.recentActivity);
        if (data.profile.mentions) this.profileService.updateListImage(data.profile.mentions);
        this.authService.storeUserData(data.token, data.user);
        this.authService.changeProfileInfo(data.user.username, data.profile, true);
      } else {
        $('#homeFailureMsgContainer').css('display', 'inline');

        setTimeout(() => {
          $('#homeFailureMsgContainer').css('display', 'none');
        }, 3000);

        $('#loginPassword').val('');
        loginForm.value.password = '';
      };
    });
  };

  expiredToken() {
    return this.authService.isExpired();
  };
}
