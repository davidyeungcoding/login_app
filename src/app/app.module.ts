import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { CreatePostComponent } from './profile/create-post/create-post.component';
import { DisplayPostComponent } from './profile/display-post/display-post.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { HttpClientModule } from '@angular/common/http';
import { FlashMessagesModule } from 'angular2-flash-messages';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    CreateAccountComponent,
    HomeComponent,
    CreatePostComponent,
    DisplayPostComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    FlashMessagesModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
