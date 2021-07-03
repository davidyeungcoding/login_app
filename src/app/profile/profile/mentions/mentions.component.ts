import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { PostService } from 'src/app/services/post.service';
import { AuthService } from 'src/app/services/auth.service';

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
  profileData: User;
  mentions: Post[];

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.postService.mentions.subscribe(_list => this.mentions = _list));
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
  }

  ngAfterViewInit(): void {
    // console.log(this.profileData)
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe;
  }

}
