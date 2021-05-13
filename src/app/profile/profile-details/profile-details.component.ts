import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { PostService } from 'src/app/services/post.service';
import { User } from '../../interfaces/user';
import { Post } from '../../interfaces/post';
import { Subscription } from 'rxjs';

import * as buffer from 'buffer';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private postArray: Post[];
  currentUser: any;
  profileData: User | undefined;
  followErrorMsg: string;
  isFollowing: boolean;
  pondFile: any = undefined;
  
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private postService: PostService
  ) { }
  
  ngOnInit(): void {
    console.log('ngOnInit')
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.profileService.isFollowing.subscribe(_following => this.isFollowing = _following));
    this.subscriptions.add(this.postService.postArray.subscribe(_posts => this.postArray = _posts));

    console.log(this.profileData);
    if (this.profileData.profileImage) this.pondFile = [`data:${this.profileData.profileImageType};charset-utf-8;base64,${this.profileData.profileImage}`];
  }
  
  ngAfterViewInit(): void {
  }
  
  ngOnDestroy(): void {
    console.log('ngOnDestroy')
    this.subscriptions.unsubscribe();
    this.authService.changeProfileData(undefined);
    if (this.pondFile) this.pondFile = undefined;
    console.log(this.profileData)
  }
    
// =====================
// || FilePond Values ||
// =====================

  @ViewChild('myPond') myPond: any;
  
  pondOptions = {
    class: 'my-filepond',
    labelIdle: 'Drop Image Here',
    imagePreviewWidth: 150,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 150,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleButtonRemoveItemPosition: 'center bottom',
    credits: false,
    acceptedFileTypes: ['image/jpeg', 'image/png']
  }

  pondHandleAddFile(event: any) {
    const file = this.myPond.getFile();
    const base64Image = file.getFileEncodeBase64String();
    const check = file.getFileEncodeDataURL();
    const type = check.split(';')[0].split(':')[1];
    const payload = {
      id: this.profileData._id,
      username: this.profileData.username,
      profileImage: base64Image,
      imageType: type
    };
    
    this.profileService.updateProfileImage(payload).subscribe(_status => {
      if (_status.success) {
        this.profileService.assignProfileImageMulti(base64Image, type, this.postArray);
      } else {
        // handle error updating image
      }
    });
  }
    
// ===============
// || Following ||
// ===============

  checkFollowing(): boolean {
    for(const [key, value] of Object.entries(this.profileData.followers)) {
      if (value.username === this.currentUser.username && value.userId === this.currentUser.id) return true;
    };
    return false;
  };

  onFollow() {
    if (this.authService.visitingProfile(this.currentUser, this.profileData)) {
      const payload = {
        followerId: this.currentUser.id,
        followerName: this.currentUser.name,
        followerUsername: this.currentUser.username,
        profileId: this.profileData._id,
        profileName: this.profileData.name,
        profileUsername: this.profileData.username
      };

      this.authService.followUser(payload).subscribe(_user => {
        if (_user.success) {
          this.authService.changeProfileData(_user.msg);
          this.profileService.changeIsFollowing(true);
        } else {
          this.followErrorMsg = _user.msg;
          $('#followErrorMsg').removeClass('visible');
          
          setTimeout(() => {
            $('#followErrorMsg').addClass('visible');
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 4000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    } else if (!localStorage.getItem('id_token')) {
      this.followErrorMsg = 'You must be logged in before following.';
      $('#followErrorMsg').removeClass('visible');

      setTimeout(() => {
        $('#followErrorMsg').addClass('visible');
      }, 4000);
    };
  };

  onUnfollow() {
    if (!this.authService.isExpired()) {
      const payload = {
        followerId: this.currentUser.id,
        followerNane: this.currentUser.name,
        followerUsername: this.currentUser.username,
        profileId: this.profileData._id,
        profileName: this.profileData.name,
        profileUsername: this.profileData.username
      };
  
      this.authService.unfollow(payload).subscribe(_user => {
        if (_user.success) {
          this.authService.changeProfileData(_user.msg);
          this.profileService.changeIsFollowing(false);
        } else {
          this.followErrorMsg = _user.msg;
          $('#followErrorMsg').removeClass('visible');

          setTimeout(() => {
            $('#followErrorMsg').addClass('visible');
            this.authService.handleRedirectProfile(this.currentUser.username);
          }, 4000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    };
  };
}
