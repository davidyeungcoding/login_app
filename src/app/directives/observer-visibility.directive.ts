import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { delay, filter } from 'rxjs/operators'

import { PostService } from '../services/post.service';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../interfaces/post';

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
  private testObserver: IntersectionObserver | undefined;
  private postCount: number;
  private posts: Post[];

  constructor(
    private element: ElementRef,
    private postService: PostService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.test();
    this.postService.postCount.subscribe(_count => this.postCount = _count);
    this.postService.currentPosts.subscribe(_postList => this.posts = _postList);
    this.testObserver.observe(this.element.nativeElement);
    // this.createObserver();
    console.log('ngOnInit')
  }
  
  ngAfterViewInit() {
    console.log('ngAfterViewInit')
    // this.startObserverElements();
  }

  ngOnDestroy() {
    console.log('ngOnDestroy')
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

  test(): void {
    this.testObserver = new IntersectionObserver(entry => {
      if (entry[0].intersectionRatio > 0) {
        const username = this.route.snapshot.paramMap.get('username');

        this.postService.loadMorePosts(username, this.posts.length).subscribe(_posts => {
          if (_posts.success) {
            this.posts.push(..._posts.msg);
            // this.postService.changePost([...this.posts, ..._posts.msg]);
          }
        })
      }
    });
  };
}
