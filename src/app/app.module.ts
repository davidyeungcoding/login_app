import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// ================
// || Components ||
// ================

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { HomeComponent } from './home/home.component';
import { CreatePostComponent } from './profile/create-post/create-post.component';
import { DisplayPostComponent } from './profile/profile/display-post/display-post.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { SearchComponent } from './search/search.component';
import { ProfileDetailsComponent } from './profile/profile-details/profile-details.component';
import { ProfileContentComponent } from './profile/profile-content/profile-content.component';
import { FollowingListComponent } from './profile/profile/following-list/following-list.component';
import { FollowerListComponent } from './profile/profile/follower-list/follower-list.component';
import { DumpScreenComponent } from './dump-screen/dump-screen.component';

// ================
// || Directives ||
// ================

import { ObserverVisibilityDirective } from './directives/observer-visibility.directive';
import { SearchDirectiveDirective } from './directives/search-directive.directive';

// =============
// || Modules ||
// =============

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlashMessagesModule } from 'angular2-flash-messages'; // come back to delete when uninstalling later
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';

// ===========
// || Other ||
// ===========

import * as bootstrap from "bootstrap";

// ==============
// || FilePond ||
// ==============

import { FilePondModule, registerPlugin } from 'ngx-filepond';
import * as FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import * as FilePondPluginImageResize from 'filepond-plugin-image-resize';
import * as FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode,
  FilePondPluginImageCrop
)

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
    FollowingListComponent,
    FollowerListComponent,
    DumpScreenComponent,
    ObserverVisibilityDirective,
    SearchDirectiveDirective,
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
    }),
    FilePondModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
