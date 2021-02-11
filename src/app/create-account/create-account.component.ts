import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';

import { ValidateService } from '../services/validate.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private validateService: ValidateService,
    private flashMessages: FlashMessagesService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onRegisterSubmit(createAccount: NgForm) {
    if (!this.validateService.validateRegister(createAccount.value)) {
      this.flashMessages.show('Please fill in all fields.', { cssClass: 'alert-danger', timeout: 3000});
      return;
    } else if (!this.validateService.validateEmail(createAccount.value.email)) {
      this.flashMessages.show('Please enter a valid email address.', { cssClass: 'alert-danger', timeout: 3000});
      return;
    };
    // add check for unique username

    this.authService.registerUser(createAccount.value).subscribe(data => {
      if (data.success) {
        this.flashMessages.show(data.msg, { cssClass: 'alert-success', timeout: 3000});
        this.router.navigate(['/home']);
      } else {
        this.flashMessages.show(data.msg, { cssClass: 'alert-danger', timeout: 3000});
        this.router.navigate(['/create-account']);
      };
    });
  }
  
}
