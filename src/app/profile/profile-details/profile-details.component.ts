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
  currentUser: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_user => this.profileData = _user);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
  }

  displayFollowing(): boolean {
    return this.profileData.followers ? !!this.profileData.followers[this.currentUser.username]
    : false;
  };

  onFollow() {
    if (this.authService.visitingProfile(this.currentUser, this.profileData)) {
      const payload = {
        followerName: this.currentUser.name,
        followerUsername: this.currentUser.username,
        profileName: this.profileData.name,
        profileUsername: this.profileData.username
      };

      this.authService.followUser(payload).subscribe(doc => {
        if (doc.success) {
          this.authService.changeProfileData(doc.msg);
        } else {
          // handle error
        }
      })
    }
    // handle expired
  };

  onUnfollow() {
    if (this.authService.visitingProfile(this.currentUser, this.profileData)) {
      const payload = {
        followerNane: this.currentUser.name,
        followerUsername: this.currentUser.username,
        profileName: this.profileData.name,
        profileUsername: this.profileData.username
      };
  
      this.authService.unfollow(payload).subscribe(doc => {
        if (doc.success) {
          this.authService.changeProfileData(doc.msg);
        } else {
          // handle error
        }
      });
    } else {
      // handle isexpired
    }
  };
}
