import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post } from '../interfaces/post';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class PostService {
  api = 'users';
  
  private postsSource = new BehaviorSubject<Post[]>([]);
  currentPosts = this.postsSource.asObservable();
  private postCountSource = new BehaviorSubject<number>(0);
  postCount = this.postCountSource.asObservable();
  private mentionsSource = new BehaviorSubject<Post[]>([]);
  mentions = this.mentionsSource.asObservable();

  constructor(
    private http: HttpClient
  ) { }

// =====================
// || Router Requests ||
// =====================

  addPost(payload: any) {
    return this.http.put(`${this.api}/profile/${payload.username}/post`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  updateLikes(payload: any) {
    return this.http.put(`${this.api}/profile/${payload.profileUsername}/post/opinion`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  deletePost(payload: any) {
    return this.http.put(`${this.api}/profile/${payload.username}/post/remove`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  loadMorePosts(username: string, start: number) {
    return this.http.get(`${this.api}/profile/${username}/loadmoreposts?start=${start}`).pipe(
      catchError(err => of(err))
    );
  };

// =======================
// || Change Observable ||
// =======================

  changePost(post: Post[]): void {
    this.postsSource.next(post);
  };

  changePostCount(count: number): void {
    this.postCountSource.next(count);
  };

  changeMentions(list: Post[]): void {
    this.mentionsSource.next(list);
  };
}
