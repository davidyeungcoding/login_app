import { Component, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { AuthService } from '../services/auth.service';
import { ProfilePreview } from '../interfaces/profile-preview';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchResults: ProfilePreview[];
  private searchTerm: string;
  endOfResults: boolean;

  constructor(
    private searchService: SearchService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.searchService.searchResults.subscribe(_results => this.searchResults = _results);
    this.searchService.currentSearchTerm.subscribe(_term => this.searchTerm = _term);
    this.searchService.endOfResults.subscribe(_status => this.endOfResults = _status);
  }

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username);
  };
}
