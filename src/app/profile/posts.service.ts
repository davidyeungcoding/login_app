import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Post } from '../post';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsSource = new BehaviorSubject<Post[]>(this.posts);
  currentPosts = this.postsSource.asObservable();

  constructor() { }

  changePosts(post: Post) {
    this.posts.push(post);
    this.postsSource.next([...this.posts]);
  }
  
}
