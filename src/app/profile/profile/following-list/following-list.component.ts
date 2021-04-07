import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import { PostService } from 'src/app/services/post.service';
import { ProfileService } from 'src/app/services/profile.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-following-list',
  templateUrl: './following-list.component.html',
  styleUrls: ['./following-list.component.css']
})
export class FollowingListComponent implements OnInit {
  private profileData: User;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(_profile => this.profileData = _profile);
  };

  followingList(): boolean {
    return this.profileData.following ? !!Object.keys(this.profileData.following).length
    : false;
  };

  changeProfileData(username: string): void {
    this.authService.getProfile(username).subscribe(_profile => {
      if (_profile.success) {
        this.authService.changeProfileData(_profile.user);
        this.postService.changePost(_profile.user.posts);
        this.profileService.resetVisible('followingList', 'postList');
      } else {
        // handle proflie not found here
        // redirect to profile not found page
      };
    });
  };
}
