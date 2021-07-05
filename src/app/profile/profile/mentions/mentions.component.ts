import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';

import { Post } from 'src/app/interfaces/post';
import { Subscription } from 'rxjs';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.css']
})
export class MentionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription;
  private isEditing: boolean;
  profileData: User;
  mentions: Post[];

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.postService.mentions.subscribe(_list => this.mentions = _list));
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
  }

  ngAfterViewInit(): void {
    console.log(this.profileData)
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe;
  }

  changeProfileData(username: string): void {
    this.profileService.resetVisible('mentionsList');
    this.profileService.resetActiveTab('mentionsTab');
    this.authService.handleRedirectProfile(username, this.isEditing);
  };
}
