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
  private profileData: User;
  profileFound: boolean;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(user => this.profileData = user);
    this.profileService.changeActiveList('postList');
    this.getProfileData();
  }

  getProfileData(): void {
    let username = this.route.snapshot.paramMap.get('username');
    this.authService.getProfile(username).subscribe(_user => {
      if (_user.success) {
        this.profileFound = true;
        this.authService.changeProfileData(_user.user);
        this.postService.changePostCount(_user.user.postCount);
        this.postService.changePost(this.profileData.posts);
      } else this.profileFound = false;
    });
  };
}
