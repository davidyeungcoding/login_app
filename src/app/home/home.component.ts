import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

import { FlashMessagesService } from 'angular2-flash-messages';
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
    private profileService: ProfileService,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.currentUser.subscribe(_currentUser => this.currentUser = _currentUser));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    $('.side-content-container').css('display', 'none');
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (localUser.id) this.authService.handleRedirectProfile(localUser.username, this.isEditing);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    $('.side-content-container').css('display', 'inline');
  }

  onLoginSubmit(loginForm: NgForm) {
    this.authService.authenticateUser(loginForm.value).subscribe(data => {
      if (data.success) {
        this.authService.storeUserData(data.token, data.user);
        this.authService.getProfile(data.user.username, data.user.username, data.user.id).subscribe(_user => {
          this.authService.changeProfileInfo(_user.user.username, _user.user, true);
        });
      } else {
        // remove and implement your own personal version of the error message below
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
        $('#loginPassword').val('');
        loginForm.value.password = '';
      };
    });
  };

  expiredToken() {
    return this.authService.isExpired();
  };
}
