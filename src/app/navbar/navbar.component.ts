import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onLogoutClick() {
    this.authService.logout();
  };

  expiredToken() {
    return this.authService.isExpired();
  };

  onLoadProfile(): void {
    let username = JSON.parse(localStorage.getItem('user')).username;
    this.authService.handleRedirectProfile(username);
  };

  onSubmitSearch(searchForm: NgForm, searchBar: string) {
    this.searchService.resetSearch();
    const term = searchForm.value.searchTerm.trim();
    searchForm.value.searchTerm = term;
    this.searchService.changeSearchTerm(term);
    if (!term.length) return;

    this.searchService.getUsers(searchForm.value, 0).subscribe(data => {
      data.success ? this.searchService.changeSearchResults(data.msg)
      : this.searchService.changeEndOfResults(true);
    });
    
    if (this.router.url !== '/search') this.router.navigate(['/search']);
    this.searchService.clearSearchBar(searchBar, searchForm);
  };
}
