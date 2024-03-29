import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import { PostService } from './post.service';
import { ProfileService } from './profile.service';

import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  api = 'users';

// =================
// || Observables ||
// =================

  private userSource = new BehaviorSubject<any>(this.localUser ? this.localUser : this.emptyUser);
  currentUser = this.userSource.asObservable();
  private profileDataSource = new BehaviorSubject<any>({});
  profileData = this.profileDataSource.asObservable();
  private lastVisitedSource = new BehaviorSubject<string>('');
  lastVisited = this.lastVisitedSource.asObservable();
  private isVisitingSource = new BehaviorSubject<boolean>(true);
  isVisiting = this.isVisitingSource.asObservable();

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
    this.postService.changeMentions(user.mentions);
    this.profileService.changeFollowingList(user.following);
    this.profileService.changeFollowingCount(user.followingCount);
    this.profileService.changeFollowerList(user.followers);
    this.profileService.changeFollowerCount(user.followerCount);
    const localUser = JSON.parse(localStorage.getItem('user'));
    this.changeIsVisiting(localUser ? localUser.username !== username : true);
    
    // =================
    // || Image Setup ||
    // =================

    user.bannerImage = user.bannerImage ? this.profileService.convertBufferToString(user.bannerImage.data)
    : '../assets/default_banner.jpg';
    user.profileImage = user.profileImage ? this.profileService.convertBufferToString(user.profileImage.data)
    : '../assets/default_image.jpg';
    if (this.profileService.initialFollowingLoad && user.following
      && user.following.length) this.profileService.updateListImage(user.following);
    if (this.profileService.initialFollowerLoad && user.followers
      && user.followers.length) this.profileService.updateListImage(user.followers);

    // ===================
    // || Redirect User ||
    // ===================

    if (redirect) this.router.navigate([`/profile/${username}`]);
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
    this.profileService.changeRecentActivity([]);
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
    
    this.getProfile(username, localUser.username, localUser.id).subscribe(_user => {
      this.changeLastVisited(username);
      
      if (!_user.success) {
        this.redirectDump('/profile-not-found', 'profile');
        return;
      };

      if (username === localUser.username && _user.user.mentions) {
        this.profileService.updateListImage(_user.user.mentions);
      };
      
      this.changeProfileInfo(username, _user.user, redirect);
      this.profileService.changeIsFollowing(_user.follower);
    });
  };

  redirectDump(route: string, term: string): void {
    this.profileService.changeDumpMessage(term);
    this.router.navigate([route]);
  };

// ===================
// || Follow Action ||
// ===================

  followerPayload(user: any, profile: User): any {
    return {
      followerId: user.id,
      followerName: user.name,
      followerUsername: user.username,
      profileId: profile._id,
      profileName: profile.name,
      profileUsername: profile.username
    };
  };

  followError(msg: string, redirect: boolean, username: string, isEditing: boolean): void {
    this.profileService.changeFollowErrorMsg(msg);
    $('#followErrorMsg').css('display', 'inline');

    setTimeout(() => {
      $('#followErrorMsg').css('display', 'none');
      if (redirect) this.handleRedirectProfile(username, isEditing);
    }, 3000);
  };

  onFollow(payload: any, profile: User, isEditing: boolean): void {
    this.followUser(payload).subscribe(_user => {
      if (_user.success) {
        profile.followerCount++;
        this.profileService.changeIsFollowing(true);
        this.changeProfileData(profile);
      } else this.followError(_user.msg, true, payload.followerUsername, isEditing);
    });
  };

  onUnfollow(payload: any, profile: User, isEditing: boolean): void {
    this.unfollow(payload).subscribe(_user => {
      if (_user.success) {
        profile.followerCount--;
        this.profileService.changeIsFollowing(false);
        this.changeProfileData(profile);
      } else this.followError(_user.msg, true, payload.followerUsername, isEditing);
    });
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

  changeLastVisited(location: string): void {
    this.lastVisitedSource.next(location);
  };

  changeIsVisiting(state: boolean): void {
    this.isVisitingSource.next(state);
  };
}
