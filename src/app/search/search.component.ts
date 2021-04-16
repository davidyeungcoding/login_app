import { Component, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchResults: any[];
  searchTerm: string;

  constructor(
    private searchService: SearchService,
    private authService: AuthService,
    private postService: PostService
  ) { }

  ngOnInit(): void {
    this.searchService.searchResults.subscribe(results => this.searchResults = results);
    this.searchService.currentSearchTerm.subscribe(term => this.searchTerm = term);
  }

  changeProfileData(username: string): void {
    this.authService.handleRedirectProfile(username);
  };
}
