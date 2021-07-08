import { Component, OnInit } from '@angular/core';

import { SearchService } from '../../services/search.service';
import { ProfileService } from '../../services/profile.service';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-content-navigation',
  templateUrl: './side-content-navigation.component.html',
  styleUrls: ['./side-content-navigation.component.css']
})
export class SideContentNavigationComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private step: number;

  constructor(
    private searchService: SearchService,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.searchService.step.subscribe(_count => this.step = _count));
  }

  onSubmitSearch(form: NgForm): void {
    const term = form.value.searchTerm.trim();
    if (!term.length) return;
    this.searchService.changeSearchTerm(term);
    this.searchService.resetSearch();
    
    this.searchService.getUsers(term, 0).subscribe(_result => {
      if (_result.success && _result.msg.length) {
        this.searchService.changeEndOfResults(_result.msg.length < this.step ? true : false);
        this.profileService.updateListImage(_result.msg);
        this.searchService.changeSearchResults(_result.msg);
        document.documentElement.scrollTop = 0;
      } else {
        this.searchService.changeEndOfResults(true);
        this.searchService.changeSearchResults(_result.msg);
      };

      if (this.router.url !== '/search') this.router.navigate(['/search']);
      this.searchService.clearSearchBar('sideSearchInput', form);
    });
  };
}
