import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { PostService } from '../services/post.service';
import { ProfileService } from '../services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from '../interfaces/post';
import { ProfilePreview } from '../interfaces/profile-preview';

@Directive({
  selector: '[appObserverVisibility]'
})
export class ObserverVisibilityDirective
  implements OnDestroy, OnInit, AfterViewInit {
  private subscriptions: Subscription = new Subscription();
  private listObserver: IntersectionObserver | undefined;
  private posts: Post[];
  private followerList: ProfilePreview[];
  private followingList: ProfilePreview[];
  private activeTab: string;

  constructor(
    private element: ElementRef,
    private postService: PostService,
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.checkListVisibility();
    this.subscriptions.add(this.postService.currentPosts.subscribe(_postList => this.posts = _postList));
    this.subscriptions.add(this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab));
    this.subscriptions.add(this.profileService.followingList.subscribe(_list => this.followingList = _list));
    this.subscriptions.add(this.profileService.followerList.subscribe(_list => this.followerList = _list));
  }
  
  ngAfterViewInit() {
    this.listObserver.observe(this.element.nativeElement);
  }
  
  ngOnDestroy() {
    if (this.listObserver) {
      this.listObserver.disconnect();
      this.listObserver = undefined;
    };
    
    this.subscriptions.unsubscribe();
  }

// ====================
// || Load More Data ||
// ====================

  loadMorePosts(username: string, postLength: number): void {
    this.postService.loadMorePosts(username, postLength).subscribe(_posts => {
      if (_posts.success) this.posts.push(..._posts.msg);
    });
  };

  loadMoreFollowing(username: string, followingLength: number): void {
    this.profileService.loadMoreFollowing(username, followingLength).subscribe(_following => {
      if (_following.success) this.followingList.push(..._following.msg);
    });
  };

  loadMoreFollowers(username: string, followerLength: number): void {
    this.profileService.loadMoreFollowers(username, followerLength).subscribe(_followers => {
      if (_followers.success) this.followerList.push(..._followers.msg);
    });
  };

// ==================================
// || Handle Intersection Observer ||
// ==================================

  checkListVisibility(): void {
    this.listObserver = new IntersectionObserver(entry => {
      if (entry[0].intersectionRatio > 0) {
        const username = this.route.snapshot.paramMap.get('username');

        switch (this.activeTab) {
          case 'postTab':
            this.loadMorePosts(username, this.posts.length);
            break;
          case 'followingTab':
            this.loadMoreFollowing(username, this.followingList.length);
            break;
          case 'followerTab':
            this.loadMoreFollowers(username, this.followerList.length);
            break;
        };
      };
    });
  };
}
