import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  profileData: User;
  private currentUser: any;
  followErrorMsg: string;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_user => this.profileData = _user);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
    console.log(this.profileData)
    console.log(this.profileData.followers)
  }
  
// ===============
// || Following ||
// ===============

  checkFollowing(): boolean {
    for(const [key, value] of Object.entries(this.profileData.followers)) {
      if (value.username === this.currentUser.username && value.userId === this.currentUser.id) return true;
    };
    return false;
  };

  displayFollowing(): boolean {
    return Object.keys(this.profileData.followers) ? this.checkFollowing() : false;
  };

  onFollow() {
    if (this.authService.visitingProfile(this.currentUser, this.profileData)) {
      const payload = {
        followerId: this.currentUser.id,
        followerName: this.currentUser.name,
        followerUsername: this.currentUser.username,
        profileId: this.profileData._id,
        profileName: this.profileData.name,
        profileUsername: this.profileData.username
      };

      this.authService.followUser(payload).subscribe(_user => {
        if (_user.success) {
          this.authService.changeProfileData(_user.msg);
        } else {
          this.followErrorMsg = _user.msg;
          $('#followErrorMsg').removeClass('visible');
          
          setTimeout(() => {
            $('#followErrorMsg').addClass('visible');
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 4000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    } else if (!localStorage.getItem('id_token')) {
      this.followErrorMsg = 'You must be logged in before following.';
      $('#followErrorMsg').removeClass('visible');

      setTimeout(() => {
        $('#followErrorMsg').addClass('visible');
      }, 4000);
    };
  };

  onUnfollow() {
    if (!this.authService.isExpired()) {
      const payload = {
        followerId: this.currentUser.id,
        followerNane: this.currentUser.name,
        followerUsername: this.currentUser.username,
        profileId: this.profileData._id,
        profileName: this.profileData.name,
        profileUsername: this.profileData.username
      };
  
      this.authService.unfollow(payload).subscribe(_user => {
        if (_user.success) {
          this.authService.changeProfileData(_user.msg);
        } else {
          this.followErrorMsg = _user.msg;
          $('#followErrorMsg').removeClass('visible');

          setTimeout(() => {
            $('#followErrorMsg').addClass('visible');
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 4000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    };
  };
}
