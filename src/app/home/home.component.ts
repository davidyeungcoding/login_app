import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
import { timestamp } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: any = this.authService.currentUser;

  constructor(
    private authService: AuthService,
    private router: Router,
    private flashMessage: FlashMessagesService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(_currentUser => this.currentUser = _currentUser);
  }

  onLoginSubmit(loginForm: NgForm) {
    this.authService.authenticateUser(loginForm.value).subscribe(data => {
      if (data.success) {
        this.authService.storeUserData(data.token, data.user);
        this.authService.changeProfileData(data.user);
        this.router.navigate([`/profile/${this.currentUser.username}`]);
      } else {
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
