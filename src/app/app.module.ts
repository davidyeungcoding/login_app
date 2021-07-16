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
import * as FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import { ProfileMutationDirective } from './directives/profile-mutation.directive';
import * as FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { AdditionalSideContentComponent } from './additional-side-content/additional-side-content.component';
import { SideContentNavigationComponent } from './additional-side-content/side-content-navigation/side-content-navigation.component';
import { SideProfileSectionComponent } from './additional-side-content/side-profile-section/side-profile-section.component';
import { SideVisitorViewComponent } from './additional-side-content/side-visitor-view/side-visitor-view.component';
import { FollowIntersectionDirective } from './directives/follow-intersection.directive';
import { MentionsComponent } from './profile/profile/mentions/mentions.component';
import { RecentActivityMutationDirective } from './directives/recent-activity-mutation.directive';

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode,
  FilePondPluginImageCrop,
  FilePondPluginImageTransform,
  FilePondPluginFileValidateType
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
    ProfileMutationDirective,
    AdditionalSideContentComponent,
    SideContentNavigationComponent,
    SideProfileSectionComponent,
    SideVisitorViewComponent,
    FollowIntersectionDirective,
    MentionsComponent,
    RecentActivityMutationDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
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
