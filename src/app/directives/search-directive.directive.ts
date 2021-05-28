import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { ProfileService } from '../services/profile.service';

import { Subscription } from 'rxjs';

@Directive({
  selector: '[appSearchDirective]'
})
export class SearchDirectiveDirective implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private searchObserver: IntersectionObserver | undefined;
  private term: string;
  private searchResults: any;
  private step: number;

  constructor(
    private searchService: SearchService,
    private profileService: ProfileService,
    private element: ElementRef
  ) { }

  ngOnInit() {
    this.checkVisible();
    this.subscriptions.add(this.searchService.currentSearchTerm.subscribe(_term => this.term = _term));
    this.subscriptions.add(this.searchService.searchResults.subscribe(_results => this.searchResults = _results));
    this.subscriptions.add(this.searchService.step.subscribe(_step => this.step = _step));
  }
  
  ngAfterViewInit() {
    this.searchObserver.observe(this.element.nativeElement);
  }
  
  ngOnDestroy() {
    if (this.searchObserver) {
      this.searchObserver.disconnect();
      this.searchObserver = undefined;
    };
    
    this.subscriptions.unsubscribe();
  }

  checkVisible() {
    this.searchObserver = new IntersectionObserver(entry => {
      if (entry[0].intersectionRatio > 0) {
        this.searchService.getUsers(this.term, this.searchResults.length).subscribe(_result => {
          if (_result.success) {
            if (_result.msg.length === 0) {
              this.searchService.changeEndOfResults(true);
            } else {
              for (let i = 0; i < _result.msg.length; i++) {
                if (_result.msg[i].profileImage) _result.msg[i].profileImage = this.profileService.convertBufferToString(_result.msg[i].profileImage.data);
              };
  
              this.searchResults.push(..._result.msg);
            };
          } else this.searchService.changeEndOfResults(true);
        });
      };
    });
  };
}
