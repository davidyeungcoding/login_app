import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { ProfileService } from 'src/app/services/profile.service';
import { AuthService } from 'src/app/services/auth.service';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-profile-section',
  templateUrl: './side-profile-section.component.html',
  styleUrls: ['./side-profile-section.component.css']
})
export class SideProfileSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private activeTab: string;
  private activeList: string;
  private isEditing: boolean;
  recentActivity: any;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.profileService.activeList.subscribe(_list => this.activeList = _list));
    this.subscriptions.add(this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
    this.subscriptions.add(this.profileService.recentActivity.subscribe(_activity => this.recentActivity = _activity));

    if (localStorage.getItem('id_token') && !this.authService.isExpired() && !this.recentActivity.length) {
      this.profileService.getRecentActivity(JSON.parse(localStorage.getItem('user')).username).subscribe(_list => {
        this.profileService.updateListImage(_list.msg);
        this.profileService.changeRecentActivity(_list.msg);
      });
    };
  }
  
  ngAfterViewInit(): void {
    this.addClickEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onLoadProfile(): void {
    const username = JSON.parse(localStorage.getItem('user')).username;

    if (this.router.url !== `/profile/${username}`) {
      this.profileService.resetActiveTab(this.activeTab);
      this.profileService.resetVisible(this.activeList);
      this.authService.handleRedirectProfile(username, this.isEditing);
    };
  };

  onLogout(): void {
    this.authService.logout(this.activeTab, this.activeList, this.isEditing);
    location.reload();
  };

  onProfileSwitch(username: string): void {
    this.profileService.resetVisible(this.activeList);
    this.profileService.resetActiveTab(this.activeTab);
    this.authService.handleRedirectProfile(username, this.isEditing);
  };

  addClickEvent(): void {
    const elements = document.getElementsByClassName('on-click');

    Array.from(elements).forEach(elem => {
      const username = elem.attributes[1].value;
      elem.addEventListener('click', () => {
        this.authService.handleRedirectProfile(username, true);
      });
      elem.classList.add('on-click-parse');
      elem.classList.remove('on-click');
    });
  };
}
