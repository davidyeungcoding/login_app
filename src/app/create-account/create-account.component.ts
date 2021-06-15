import { Component, OnDestroy, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ValidateService } from '../services/validate.service';

import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private validateService: ValidateService,
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
            $('#successMsg').css('display', 'block');

            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2500);
          } else {
            $('#failureMsg').css('display', 'block');
          };
        });
      };
    });
  };
}
