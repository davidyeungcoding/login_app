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
  private mentions: Post[];
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
    this.subscriptions.add(this.postService.mentions.subscribe(_list => this.mentions = _list));
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

  loadMore(username: string, target: string, length: number): void {
    this.profileService.loadMore(username, target, length).subscribe(_list => {
      const targetList = target === 'following' ? this.followingList
      : target === 'followers' ? this.followerList
      : this.mentions;
      console.log('===============================')
      console.log(_list);

      if (_list.success) {
        this.profileService.updateListImage(_list.msg);
        targetList.push(..._list.msg);
      };
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
            this.loadMore(username, 'following', this.followingList.length);
            break;
          case 'followerTab':
            this.loadMore(username, 'followers', this.followerList.length);
            break;
          case 'mentionsTab':
            this.loadMore(username, 'mentions', this.mentions.length);
        };
      };
    });
  };
}
