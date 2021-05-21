import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appSearchDirective]'
})
export class SearchDirectiveDirective implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private searchObserver: IntersectionObserver | undefined;
  private term: string;
  private searchResults: any;

  constructor(
    private searchService: SearchService,
    private element: ElementRef
  ) { }

  ngOnInit() {
    this.checkVisible();
    this.subscriptions.add(this.searchService.currentSearchTerm.subscribe(_term => this.term = _term));
    this.subscriptions.add(this.searchService.searchResults.subscribe(_results => this.searchResults = _results));
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
          _result.success ? this.searchResults.push(..._result.msg)
          : this.searchService.changeEndOfResults(true);
          if (this.searchResults.length % 3 !== 0 || _result.msg.length === 0) this.searchService.changeEndOfResults(true);
        });
      };
    });
  };
}
