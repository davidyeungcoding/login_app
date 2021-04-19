import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { ProfilePreview } from '../interfaces/profile-preview';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

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

  constructor() { }

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
