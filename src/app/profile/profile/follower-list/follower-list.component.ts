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

  followersList(): boolean {
    return this.profileData.followers ? !!Object.keys(this.profileData.followers).length
    : false;
  };

  endOfFollowerList(): boolean {
    return Object.keys(this.profileData.followers).length === this.profileData.followerCount;
  };

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username);
    this.profileService.resetVisible('followerList');
    this.profileService.resetActiveTab('followerTab');
  };
}
