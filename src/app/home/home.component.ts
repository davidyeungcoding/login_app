import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  currentUser: any = this.authService.currentUser;

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private router: Router,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.currentUser.subscribe(_currentUser => this.currentUser = _currentUser));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onLoginSubmit(loginForm: NgForm) {
    this.authService.authenticateUser(loginForm.value).subscribe(data => {
      if (data.success) {
        this.authService.storeUserData(data.token, data.user);
        this.router.navigate([`/profile/${this.currentUser.username}`]);
      } else {
        // remove and implement your own personal version of the error message below
        this.flashMessage.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
        $('#loginPassword').val('');
        loginForm.value.password = '';
      };
    });
  }

  expiredToken() {
    return this.authService.isExpired();
  };
}
