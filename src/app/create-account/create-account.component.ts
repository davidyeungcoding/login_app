import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ValidateService } from '../services/validate.service';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private validateService: ValidateService,
    private flashMessages: FlashMessagesService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  onRegisterSubmit(createAccount: NgForm) {
    this.validateService.validateRegister(createAccount.value).then(_status => {
      if (_status) {
        this.authService.registerUser(createAccount.value).subscribe(data => {
          if (data.success) {

            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 3000)
            // this.flashMessages.show(data.msg, { cssClass: 'alert-success', timeout: 3000});
          } else {
            this.flashMessages.show(data.msg, { cssClass: 'alert-danger', timeout: 3000});
            this.router.navigate(['/create-account']);
          };
        });
      };
    });
  };
}
