import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Post } from '../../post';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  postSub: Subscription;

  constructor(public postsService: PostsService) { }

  ngOnInit(): void {
    this.postSub = this.postsService.currentPosts.subscribe(_posts => this.posts = _posts);
  }

  ngOnDestroy() {
    this.postSub.unsubscribe();
  }

}
