import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private isEditing: boolean;
  searchTerm: string;
  searchResults: any;
  endOfResults: boolean;

  constructor(
    private searchService: SearchService,
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.searchService.searchResults.subscribe(_results => this.searchResults = _results));
    this.subscriptions.add(this.searchService.currentSearchTerm.subscribe(_term => this.searchTerm = _term));
    this.subscriptions.add(this.searchService.endOfResults.subscribe(_status => this.endOfResults = _status));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username, this.isEditing);
  };
}
