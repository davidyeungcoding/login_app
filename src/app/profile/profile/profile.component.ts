import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileData: User;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(user => this.profileData = user);
    this.profileService.changeActiveList('postList');
    if (!this.profileData.username
      || this.profileData.username !== this.route.snapshot.paramMap.get('username')) this.getProfileData();
  }

  getProfileData(): void {
    let username = this.route.snapshot.paramMap.get('username');
    this.authService.handleRedirectProfile(username, false);
  };
}
