import { Component, OnInit } from '@angular/core';

import { Post } from '../../interfaces/post';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit {
  posts: Post[];
  profileData: any;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.postService.currentPosts.subscribe(_posts => this.posts = _posts);
    this.authService.profileData.subscribe(_profile => this.profileData = _profile);
  }
}
