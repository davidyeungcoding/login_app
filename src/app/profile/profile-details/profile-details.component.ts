import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {
  profileData: User;
  private currentUser: any;
  followErrorMsg: string = '';

  constructor(
    private authService: AuthService,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_user => this.profileData = _user);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
  }

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
            this.followErrorMsg = '';
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 5000);
        };
      });
      // consider handling all below actions in a service function for all components
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      // handle expired
      this.authService.logout();
      // redirect user to expired token page
    } else if (!localStorage.getItem('id_token')) {
      // handle not logged in condition
      // modal informing user needs to log in before they can use feature
    }
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
  
      this.authService.unfollow(payload).subscribe(doc => {
        if (doc.success) {
          this.authService.changeProfileData(doc.msg);
        } else {
          // handle error
          // redirect to profile not found for followed profile
        }
      });
    } else {
      // handle isexpired
      // redirect to expired session page informing the problem
      // redirect to home and logout / maybe logout and stay on page
    }
  };
}
