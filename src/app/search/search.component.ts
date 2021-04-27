import { Component, OnDestroy, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { AuthService } from '../services/auth.service';
import { ProfilePreview } from '../interfaces/profile-preview';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  searchResults: ProfilePreview[];
  private searchTerm: string;
  endOfResults: boolean;

  constructor(
    private searchService: SearchService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.searchService.searchResults.subscribe(_results => this.searchResults = _results));
    this.subscriptions.add(this.searchService.currentSearchTerm.subscribe(_term => this.searchTerm = _term));
    this.subscriptions.add(this.searchService.endOfResults.subscribe(_status => this.endOfResults = _status));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username);
  };
}
