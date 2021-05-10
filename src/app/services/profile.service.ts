import { Injectable } from '@angular/core';

import { PostService } from './post.service';
import { BehaviorSubject, of } from 'rxjs';
import { ProfilePreview } from '../interfaces/profile-preview';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  api = 'http://localhost:3000/users';
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

// ===================================
// || Active Tabs and Display Lists ||
// ===================================

  private activeListSource = new BehaviorSubject<string>('postList');
  activeList = this.activeListSource.asObservable();
  private activeTabSource = new BehaviorSubject<string>('postTab');
  activeTab = this.activeTabSource.asObservable();

// ==========================
// || Handle Error Message ||
// ==========================

  private dumpMessageSource = new BehaviorSubject<string>('');
  dumpMessage = this.dumpMessageSource.asObservable();

// ========================================
// || Follower and Following Information ||
// ========================================

  private followerListSource = new BehaviorSubject<ProfilePreview[]>([]);
  followerList = this.followerListSource.asObservable();
  private followerCountSource = new BehaviorSubject<number>(0);
  followerCount = this.followerCountSource.asObservable();
  private followingListSource = new BehaviorSubject<ProfilePreview[]>([]);
  followingList = this.followingListSource.asObservable();
  private followingCountSource = new BehaviorSubject<number>(0);
  followingCount = this.followingCountSource.asObservable();
  private isFollowingSource = new BehaviorSubject<boolean>(false);
  isFollowing = this.isFollowingSource.asObservable();

  constructor(
    private http: HttpClient,
    private postService: PostService
  ) { }

// =================
// || Reset State ||
// =================

  resetVisible(add: string): void {
    $(`#${add}`).addClass('visible');
    $('#postList').removeClass('visible');
    this.changeActiveList('postList');
  };

  resetActiveTab(tab: string): void {
    $(`#${tab}`).removeClass('active-tab');
    $('#postTab').addClass('active-tab');
    this.changeActiveTab('postTab');
  };

// ===================
// || Profile Image ||
// ===================

  assignProfileImageMulti(image: Buffer, type: string, target: any): void {
    const profileImage = `data:${type};charset-utf-8;base64,${image}`;

    for (let i = 0; i < target.length; i++) {
      target[i].setAttribute('src', profileImage);
    };
  };

// ===================
// || Get More Data ||
// ===================

  loadMoreFollowers(username: string, followerCount: number) {
    return this.http.get(`${this.api}/profile/${username}/loadmorefollowers?start=${followerCount}`).pipe(
      catchError(err => of(err))
    );
  };

  loadMoreFollowing(username: string, followingCount: number) {
    return this.http.get(`${this.api}/profile/${username}/loadmorefollowing?start=${followingCount}`).pipe(
      catchError(err => of(err))
    );
  };

  updateProfileImage(payload: any) {
    return this.http.post(`${this.api}/profile/${payload.username}/image`, payload, this.httpOptions).pipe(
      catchError(err => of(err))
    );
  };

// =======================
// || Change Observable ||
// =======================

  changeActiveList(list: string): void {
    this.activeListSource.next(list);
  };
  
  changeActiveTab(tab: string): void {
    this.activeTabSource.next(tab);
  };

  changeDumpMessage(term: string): void {
    this.dumpMessageSource.next(term);
  };

  changeFollowerList(list: ProfilePreview[]): void {
    this.followerListSource.next(list);
  };

  changeFollowerCount(count: number): void {
    this.followerCountSource.next(count);
  };

  changeFollowingList(list: ProfilePreview[]): void {
    this.followingListSource.next(list);
  };

  changeFollowingCount(count: number): void {
    this.followingCountSource.next(count);
  };

  changeIsFollowing(check: boolean): void {
    this.isFollowingSource.next(check);
  };
}
