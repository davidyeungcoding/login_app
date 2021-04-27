import { AfterViewInit, Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { ProfilePreview } from '../interfaces/profile-preview';

@Directive({
  selector: '[appSearchDirective]'
})
export class SearchDirectiveDirective implements OnInit, AfterViewInit, OnDestroy {
  private searchObserver: IntersectionObserver | undefined;
  private term: string;
  private searchResults: ProfilePreview[];

  constructor(
    private searchService: SearchService,
    private element: ElementRef
  ) { }

  ngOnInit() {
    this.checkVisible();
    this.searchService.currentSearchTerm.subscribe(_term => this.term = _term);
    this.searchService.searchResults.subscribe(_results => this.searchResults = _results);
  }
  
  ngAfterViewInit() {
    this.searchObserver.observe(this.element.nativeElement);
  }

  ngOnDestroy() {
    if (this.searchObserver) {
      this.searchObserver.disconnect();
      this.searchObserver = undefined;
    };
  }

  checkVisible() {
    this.searchObserver = new IntersectionObserver(entry => {
      if (entry[0].intersectionRatio > 0) {
        this.searchService.getUsers({searchTerm: this.term}, this.searchResults.length).subscribe(_result => {
          _result.success ? this.searchResults.push(..._result.msg)
          : this.searchService.changeEndOfResults(true);
          if (this.searchResults.length % 25 !== 0 || _result.msg.length === 0) this.searchService.changeEndOfResults(true);
        });
      };
    });
  };
}
