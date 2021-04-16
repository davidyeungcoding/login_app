import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { PostService } from 'src/app/services/post.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-follower-list',
  templateUrl: './follower-list.component.html',
  styleUrls: ['./follower-list.component.css']
})
export class FollowerListComponent implements OnInit {
  private profileData: User;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_profile => this.profileData = _profile);
  }

  followersLength(): boolean {
    return this.profileData.followers ? !!Object.keys(this.profileData.followers).length
    : false;
  };

  changeProfileData(username: string): void {
    this.authService.getProfile(username).subscribe(_profile => {
      if (_profile.success) {
        this.authService.changeProfileData(_profile.user);
        this.postService.changePostCount(_profile.user.postCount);
        this.postService.changePost(_profile.user.posts);
        this.profileService.resetVisible('followerList');
        this.profileService.resetActiveTab('followerTab');
      } else {
        this.authService.redirectDump('profile-not-found', 'profile');
      };
    });
  };
}
