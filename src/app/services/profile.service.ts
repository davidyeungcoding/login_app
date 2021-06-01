import { Injectable } from '@angular/core';

// import { PostService } from './post.service';
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

// ==================
// || Edit Profile ||
// ==================

  private isEditingSource = new BehaviorSubject<boolean>(false);
  isEditing = this.isEditingSource.asObservable();
  private initialFollowingLoadSource = new BehaviorSubject<boolean>(true);
  initialFollowingLoad = this.initialFollowingLoadSource.asObservable();
  private initialFollowerLoadSource = new BehaviorSubject<boolean>(true);
  initialFollowerLoad = this.initialFollowerLoadSource.asObservable();

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
    // private postService: PostService
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

  resetEditState(): void {
    this.changeIsEditing(false);
    $('#initEdit').css('display', 'inline');
    $('.profile-image-control').css('display', 'inline');
    $('.pond-image-control').css('display', 'none');
    $('.resolveEdit').css('display', 'none');
  };

  // resetDefaultProfileImage(): void {
  //   $('#profileImage').attr('src', '../../../assets/default_image.jpg');
  //   $('#profileImagePreview').attr('src', '../../../assets/default_image.jpg');
  // };

// ===================
// || Profile Image ||
// ===================

  convertBufferToString(buffer: any): string {
    let res = '';
    buffer.forEach(_element => res += String.fromCharCode(_element));
    return res;
  };

  updateListImage(list: ProfilePreview[]): void {
    list.forEach(_profile => {
      _profile.profileImage = _profile.profileImage ? this.convertBufferToString(_profile.profileImage.data)
      : '../../../../assets/default_image.jpg';
    });
  };

  assignProfileImage(image: any, target: any): void {
    for (let i = 0; i < target.length; i++) {
      target[i].setAttribute('src', image);
    };
  };

  assignProfilePreviewImage(target: any, start: number = 0): void {
    for (let i = start; i < target.length; i++) {
      if (target[i].attributes[3]) {
        const image = target[i].attributes[3].value;
        target[i].setAttribute('src', image);
      } else target[i].setAttribute('src', '../../../../assets/default_image.jpg');
    };
  };

// ===================
// || Get More Data ||
// ===================

  loadMore(username: string, target: string, followingCount: number) {
    return this.http.get(`${this.api}/profile/${username}/loadmore?list=${target}&start=${followingCount}`).pipe(
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

  changeIsEditing(state: boolean): void {
    this.isEditingSource.next(state);
  };

  changeInitialFollowingLoad(state: boolean): void {
    this.initialFollowingLoadSource.next(state);
  };

  changeInitialFollowerLoad(state: boolean): void {
    this.initialFollowerLoadSource.next(state);
  };
}
