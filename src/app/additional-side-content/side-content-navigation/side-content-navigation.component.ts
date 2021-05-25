import { Component, OnInit } from '@angular/core';

import { SearchService } from '../../services/search.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-content-navigation',
  templateUrl: './side-content-navigation.component.html',
  styleUrls: ['./side-content-navigation.component.css']
})
export class SideContentNavigationComponent implements OnInit {

  constructor(
    private searchService: SearchService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onSubmitSearch(form: NgForm): void {
    const term = form.value.searchTerm.trim();
    if (!term.length) return;
    this.searchService.changeSearchTerm(term);

    this.searchService.getUsers(term, 0).subscribe(_result => {
      _result.success ? this.searchService.changeSearchResults(_result.msg)
      : this.searchService.changeEndOfResults(true);

      if (this.router.url !== '/search') this.router.navigate(['/search']);
      this.searchService.clearSearchBar('sideSearchInput', form);
    });
  };
}
