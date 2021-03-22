import { Component, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';
import { AuthService } from '../services/auth.service';

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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.searchService.searchResults.subscribe(results => this.searchResults = results);
    this.searchService.currentSearchTerm.subscribe(term => this.searchTerm = term);
  }

  changeProfileData(username: string): void {
    this.authService.getProfile(username).subscribe(doc => {
      doc.success ? this.authService.changeProfileData(doc.user)
      : this.authService.changeProfileData(this.authService.emptyUser);
    });
  };
}
