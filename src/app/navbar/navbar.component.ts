import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
import { ProfileService } from '../services/profile.service';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private activeList: string;
  private activeTab: string;
  private isEditing: boolean;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.profileService.activeList.subscribe(_list => this.activeList = _list);
    this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
    this.profileService.isEditing.subscribe(_state => this.isEditing = _state);
  }

  onLogoutClick() {
    this.authService.logout(this.activeTab, this.activeList, this.isEditing);
  };

  expiredToken() {
    return this.authService.isExpired();
  };

  onLoadProfile(): void {
    let username = JSON.parse(localStorage.getItem('user')).username;
    this.profileService.resetActiveTab(this.activeTab);
    this.profileService.resetVisible(this.activeList);
    if (this.router.url !== `/profile/${username}`) this.authService.handleRedirectProfile(username, this.isEditing);
  };

  onSubmitSearch(searchForm: NgForm, searchBar: string) {
    this.searchService.resetSearch();
    const term = searchForm.value.searchTerm.trim();
    this.searchService.changeSearchTerm(term);
    if (!term.length) return;

    this.searchService.getUsers(term, 0).subscribe(data => {
      if (data.success && data.msg.length) {
        this.searchService.changeEndOfResults(false);
        this.profileService.updateListImage(data.msg);
        this.searchService.changeSearchResults(data.msg);
      } else this.searchService.changeEndOfResults(true);
      
      if (this.router.url !== '/search') this.router.navigate(['/search']);
      this.searchService.clearSearchBar(searchBar, searchForm);
    });
  };
}
