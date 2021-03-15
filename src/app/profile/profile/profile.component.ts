import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
// import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { Post } from '../../interfaces/post';

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
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(user => this.profileData = user);
    this.getProfileData();
  }

  getProfileData(): void {
    let username = this.route.snapshot.paramMap.get('username');
    this.authService.getProfile(username).subscribe(_user => {
      // data.success ? this.profileData = data.user
      // : undefined;
      // insert user not found handling in place of undefined
      if (_user.success) {
        this.profileFound = true;
        // this.profileData = _user.user;
        this.authService.changeProfileData(_user.user);
        // do I need this? currently leaning no
        this.postService.changePost(this.profileData.posts);
      } else this.profileFound = false;
    });
  };
}
