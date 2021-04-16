import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';
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
  api = 'http://localhost:3000/users';
  
  postsSource = new BehaviorSubject<Post[]>([]);
  currentPosts = this.postsSource.asObservable();
  postCountSource = new BehaviorSubject<number>(0);
  postCount = this.postCountSource.asObservable();

  constructor(
    private http: HttpClient
  ) { }

// =====================
// || Router Requests ||
// =====================

  addPost(form: NgForm) {
    const localUser = JSON.parse(localStorage.getItem('user'));
    const post = {
      userId: localUser.id,
      content: {
        timestamp: new Date().toLocaleString(),
        content: form.value.content.trim()
      }
    };
    return this.http.put(`${this.api}/profile/${localUser.username}/post`, post, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  updateLikes(payload: any) {
    return this.http.put(`${this.api}/profile/${payload.profileUsername}/post/opinion`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  deletePost(payload: any) {
    const username = JSON.parse(localStorage.getItem('user')).username;
    return this.http.put(`${this.api}/profile/${username}/post/remove`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  // getPosts(username) {
  //   return this.http.get(`${this.api}/profile/${username}/post`).pipe(
  //     catchError(err => of(err))
  //   );
  // };

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
}
