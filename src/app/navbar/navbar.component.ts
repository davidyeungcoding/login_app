import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
import { PostService } from '../services/post.service';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private currentUser: any;
  private searchResults: any[];

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(_currentUser => this.currentUser = _currentUser);
    this.searchService.searchResults.subscribe(results => this.searchResults = results);
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

  onSubmitSearch(searchForm: NgForm) {
    searchForm.value.searchTerm = searchForm.value.searchTerm.trim();
    this.searchService.changeSearchTerm(searchForm.value.searchTerm);
    if (!searchForm.value.searchTerm.length) return;
    this.searchService.getUsers(searchForm.value).subscribe(data => {
      data.success ? this.searchService.changeSearchResults(data.msg)
      : this.searchService.changeSearchResults([]);
    if (!(this.router.url === '/search')) this.router.navigate(['/search']);
    $('#navSearch').val('');
    searchForm.value.searchTerm = '';
    });
  };
}
