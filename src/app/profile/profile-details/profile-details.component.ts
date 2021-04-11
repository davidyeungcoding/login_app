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
  }
  
// ===============
// || Following ||
// ===============

  displayFollowing(): boolean {
    return this.profileData.followers ? !!this.profileData.followers[this.currentUser.username]
    && this.profileData.followers[this.currentUser.username].userId === this.currentUser.id
    : false;
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
          document.getElementById('followErrorMsg').classList.remove('visible');
          
          setTimeout(() => {
            document.getElementById('followErrorMsg').classList.add('visible');
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 5000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    } else if (!localStorage.getItem('id_token')) {
      this.followErrorMsg = 'You must be logged in before following.';
      document.getElementById('followErrorMsg').classList.remove('visible');

      setTimeout(() => {
        document.getElementById('followErrorMsg').classList.add('visible');
      }, 5000);
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
          document.getElementById('followErrorMsg').classList.remove('visible');

          setTimeout(() => {
            document.getElementById('followErrorMsg').classList.add('visible');
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 5000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    };
  };
}
