import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { HomeComponent } from './home/home.component';
import { CreatePostComponent } from './profile/create-post/create-post.component';
import { DisplayPostComponent } from './profile/display-post/display-post.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { SearchComponent } from './search/search.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';
import { ProfileContentComponent } from './profile/profile-content/profile-content.component';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import * as bootstrap from "bootstrap";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CreateAccountComponent,
    HomeComponent,
    CreatePostComponent,
    DisplayPostComponent,
    ProfileComponent,
    SearchComponent,
    ProfileDetailsComponent,
    ProfileContentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    FlashMessagesModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('id_token');
        }
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
