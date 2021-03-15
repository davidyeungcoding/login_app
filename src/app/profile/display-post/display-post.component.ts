import { Component, OnInit } from '@angular/core';

import { Post } from '../../interfaces/post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit {
  posts: Post[];

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.postService.currentPosts.subscribe(_posts => this.posts = _posts);
  }
}
