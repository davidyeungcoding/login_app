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
  private localUser = JSON.parse(localStorage.getItem('user'));
  postsSource = new BehaviorSubject<Post[]>([]);
  currentPosts = this.postsSource.asObservable();
  api = 'http://localhost:3000/users';

  constructor(
    private http: HttpClient
  ) { }

  addPost(form: NgForm) {
    const post = {
      userId: this.localUser.id,
      content: {
        timestamp: new Date().toLocaleString(),
        content: form.value.content.trim()
      }
    };
    return this.http.put(`${this.api}/profile/${this.localUser.username}/post`, post, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  getPosts(username) {
    return this.http.get(`${this.api}/profile/${username}/post`).pipe(
      catchError(err => of(err))
    );
  };

  changePost(post: Post[]): void {
    this.postsSource.next(post);
  };
}
