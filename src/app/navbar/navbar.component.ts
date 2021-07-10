import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
import { ProfileService } from '../services/profile.service';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private activeList: string;
  private activeTab: string;
  private isEditing: boolean;
  private step: number;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private searchService: SearchService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.profileService.activeList.subscribe(_list => this.activeList = _list));
    this.subscriptions.add(this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.searchService.step.subscribe(_count => this.step = _count));
  }

  onSubmitSearch(form: NgForm): void {
    const term = form.value.searchTerm.trim();
    if (!term.length) return;
    this.searchService.changeSearchTerm(term);
    this.searchService.resetSearch();

    this.searchService.getUsers(term, 0).subscribe(_res => {
      if (_res.success && _res.msg.length) {
        this.searchService.changeEndOfResults(_res.msg.length < this.step ? true : false);
        this.profileService.updateListImage(_res.msg);
        this.searchService.changeSearchResults(_res.msg);
      } else {
        this.searchService.changeEndOfResults(true);
        this.searchService.changeSearchResults(_res.msg);
      };
    });
    
    if (this.router.url !== '/search') this.router.navigate(['/search']);
    this.searchService.clearSearchBar('navSearchInput', form);
  };

  // =======================
  // || Logged In Actions ||
  // =======================

  onGoHome(): void {
    this.authService.handleRedirectProfile(this.currentUser.username, this.isEditing);
  };

  onLogout(): void {
    this.authService.logout(this.activeTab, this.activeList, this.isEditing);
    location.reload();
  };

  // =====================
  // || Visitor Actions ||
  // =====================

  onNavSignIn(form: NgForm): void {
    this.authService.authenticateUser(form.value).subscribe(_data => {
      console.log(_data)
      if (_data.success) {
        this.authService.storeUserData(_data.token, _data.user);
        location.reload();
      } else {
        $('#navErrorMsg').css('display', 'inline');
        $('#navPassword').val('');
        form.value.password = '';

        setTimeout(() => {
          $('#navErrorMsg').css('display', 'none');
        }, 3000);
      };
    });
  };
}
