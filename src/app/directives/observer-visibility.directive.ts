import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { delay, filter } from 'rxjs/operators'

import { PostService } from '../services/post.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { Post } from '../interfaces/post';
import { ProfilePreview } from '../interfaces/profile-preview';

@Directive({
  selector: '[appObserverVisibility]'
})
export class ObserverVisibilityDirective
  implements OnDestroy, OnInit, AfterViewInit {
  // @Input() debounceTime = 0;
  // @Input() threshold = 1;

  // @Output() visible = new EventEmitter<HTMLElement>();

  // private observer: IntersectionObserver | undefined;
  // private subject$ = new Subject<{
  //   entry: IntersectionObserverEntry;
  //   observer: IntersectionObserver;
  // }>();
  private listObserver: IntersectionObserver | undefined;
  private posts: Post[];
  private postCount: number;
  private followerList: ProfilePreview[];
  private followingList: ProfilePreview[];
  private activeTab: string;

  constructor(
    private element: ElementRef,
    private postService: PostService,
    private route: ActivatedRoute,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.checkListVisibility();
    this.postService.postCount.subscribe(_count => this.postCount = _count);
    this.postService.currentPosts.subscribe(_postList => this.posts = _postList);
    this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab);
    this.profileService.followingList.subscribe(_list => this.followingList = _list);
    this.profileService.followerList.subscribe(_list => this.followerList = _list);
    // this.createObserver();
  }
  
  ngAfterViewInit() {
    this.listObserver.observe(this.element.nativeElement);
    // this.startObserverElements();
  }

  ngOnDestroy() {
    if (this.listObserver) {
      this.listObserver.disconnect();
      this.listObserver = undefined;
    };
    // if (this.observer) {
    //   this.observer.disconnect();
    //   this.observer = undefined;
    // };
    
    // this.subject$.next();
    // this.subject$.complete();
  }

  // private isVisible(element: HTMLElement) {
  //   return new Promise(resolve => {
  //     const observer = new IntersectionObserver(([entry]) => {
  //       // console.log(entry)
  //       resolve(entry.intersectionRatio === 1);
  //       observer.disconnect();
  //     });
  //     observer.observe(element);
  //   });
  // }

  // private createObserver() {
  //   const options = {
  //     rootMargin: '0px',
  //     threshold: this.threshold
  //   };

  //   const isIntersecting = (entry: IntersectionObserverEntry) => {
  //     return entry.isIntersecting || entry.intersectionRatio > 0;
  //   };

  //   this.observer = new IntersectionObserver((entries, observer) => {
  //     entries.forEach(entry => {
  //       if (isIntersecting(entry)) this.subject$.next({entry, observer});
  //     });
  //   }, options);
  // }

  // private startObserverElements() {
  //   if (!this.observer) return;

  //   this.observer.observe(this.element.nativeElement);

  //   this.subject$.pipe(
  //     delay(this.debounceTime),
  //     filter(Boolean)
  //   ).subscribe(async ({entry, observer}) => {
  //     const target = entry.target as HTMLElement;
  //     const isStillVisible = await this.isVisible(target);

  //     if (isStillVisible) {
  //       this.visible.emit(target);
  //       observer.unobserve(target);
  //     }
  //   })
  // }

// ==============
// || Personal ||
// ==============

  loadMorePosts(username: string, postLength: number): void {
    this.postService.loadMorePosts(username, postLength).subscribe(_posts => {
      if (_posts.success) this.posts.push(..._posts.msg);
    });
  };

  loadMoreFollowing(username: string, followingLength: number): void {
    this.profileService.loadMoreFollowing(username, followingLength).subscribe(_following => {
      if (_following.success) this.followingList.push(..._following.msg);
    })
  }

  loadMoreFollowers(username: string, followerLength: number): void {
    this.profileService.loadMoreFollowers(username, followerLength).subscribe(_followers => {
      if (_followers.success) this.followerList.push(..._followers.msg);
    });
  };

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
