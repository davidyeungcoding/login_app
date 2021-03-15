import { Component, OnInit } from '@angular/core';

import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchResults: any[];
  searchTerm: string;

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.searchService.searchResults.subscribe(results => this.searchResults = results);
    this.searchService.currentSearchTerm.subscribe(term => this.searchTerm = term);
  }

}
