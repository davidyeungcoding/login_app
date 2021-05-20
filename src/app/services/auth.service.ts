import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../interfaces/user';
import { PostService } from './post.service';
import { Router } from '@angular/router';

import { ProfileService } from './profile.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private localUser = JSON.parse(localStorage.getItem('user'));
  private emptyUser = {
    id: false,
    username: false
  };
  authToken: any;
  api = 'http://localhost:3000/users';

// =================
// || Observables ||
// =================

  private userSource = new BehaviorSubject<any>(this.localUser ? this.localUser : this.emptyUser);
  currentUser = this.userSource.asObservable();
  private profileDataSource = new BehaviorSubject<any>({});
  profileData = this.profileDataSource.asObservable();

  constructor(
    private postService: PostService,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

// =====================
// || Router Requests ||
// =====================

  registerUser(user) {
    return this.http.post(`${this.api}/register`, user, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  authenticateUser(user) {
    return this.http.post(`${this.api}/authenticate`, user, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  getProfile(profileUsername, username: string, id: string) {
    return this.http.get(`${this.api}/profile/${profileUsername}?currentUsername=${username}&currentId=${id}`).pipe(
      catchError(err => of(err))
    );
  };

  // getVisitingProfile(profileUsername, username: string, id: string) {
  //   return this.http.get(`${this.api}/profile/${profileUsername}/visiting?currentUsername=${username}&currentId=${id}`).pipe(
  //     catchError(err => of(err))
  //   );
  // };

  followUser(payload) {
    return this.http.put(`${this.api}/profile/${payload.profileUsername}/follow`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

  unfollow(payload) {
    return this.http.put(`${this.api}/profile/${payload.profileUsername}/unfollow`, payload, httpOptions).pipe(
      catchError(err => of(err))
    );
  };

// ========================
// || User Profile Setup ||
// ========================

  storeUserData(token, user): void {
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.changeUser(user);
  };

  // loadToken() {
  //   const token = localStorage.getItem('id_token');
  //   this.authToken = token;
  // };

  isExpired() {
    return this.jwtHelper.isTokenExpired();
  };

  changeProfileInfo(username: string, user: User, redirect: boolean): void {
    this.changeProfileData(user);
    this.postService.changePost(user.posts);
    this.postService.changePostCount(user.postCount);
    this.profileService.changeFollowingList(user.following);
    this.profileService.changeFollowingCount(user.followingCount);
    this.profileService.changeFollowerList(user.followers);
    this.profileService.changeFollowerCount(user.followerCount);
    if (redirect) this.router.navigate([`/profile/${username}`]);
  };

// ============================
// || Change Observable Data ||
// ============================

  changeUser(user: any): void {
    user ? this.userSource.next({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    }) : this.userSource.next(this.emptyUser);
  };

  changeProfileData(user: any): void {
    this.profileDataSource.next(user);
  };

// ====================
// || Verify Profile ||
// ====================

  visitingProfile(currentUser, profileUser): boolean {
    return currentUser.id && !this.isExpired()
    && currentUser.username !== profileUser.username ? true : false;
  };

// =======================
// || Logout & Redirect ||
// =======================

  logout(activeTab: string, activeList: string, isEditing: boolean): void {
    if (isEditing) this.profileService.resetEditState();
    this.profileService.resetActiveTab(activeTab);
    this.profileService.resetVisible(activeList);
    this.authToken = null;
    this.changeUser(null);
    localStorage.clear();
  };

  handleRedirectProfile(username: string, isEditing: boolean, redirect: boolean = true): void {
    const localUser = !!localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))
    : this.emptyUser;
    if (isEditing) this.profileService.resetEditState();
    if (username !== localUser.username) {
      this.profileService.changeInitialFollowingLoad(true);
      this.profileService.changeInitialFollowerLoad(true);
    };
    this.profileService.resetDefaultProfileImage();

    this.getProfile(username, localUser.username, localUser.id).subscribe(_user => {
      if (_user.success) {
        this.changeProfileInfo(username, _user.user, redirect);
        this.profileService.changeIsFollowing(_user.follower);
      } else this.redirectDump('/profile-not-found', 'profile');
    });
  };

  redirectDump(route: string, term: string): void {
    // needs more work
    // redirect to profile not found then timeout follow up with logout
    // needs to be tested
    this.profileService.changeDumpMessage(term);
    this.router.navigate([route]);
  };
}
