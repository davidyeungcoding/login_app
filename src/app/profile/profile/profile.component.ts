import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private profileData: User;
  private currentUser: any;
  private activeData: string = 'postList';
  profileFound: boolean;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.profileData.subscribe(user => this.profileData = user);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
    this.getProfileData();
  }

  getProfileData(): void {
    let username = this.route.snapshot.paramMap.get('username');
    this.authService.getProfile(username).subscribe(_user => {
      if (_user.success) {
        this.profileFound = true;
        this.authService.changeProfileData(_user.user);
        this.postService.changePost(this.profileData.posts);
      } else this.profileFound = false;
    });
  };

  onMakeActive(id: string): void {
    const current = document.getElementById(id);
    const previous = document.getElementById(this.activeData);

    if (id !== this.activeData) {
      previous.classList.add('visible');
      current.classList.remove('visible');
      this.activeData = id;
    };
  };

  personalProfile(): boolean {
    return this.authService.personalProfile(this.currentUser, this.profileData);
  };
}
