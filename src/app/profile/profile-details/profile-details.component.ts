import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../interfaces/user';
import { Subscription } from 'rxjs';

import * as Buffer from 'buffer';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private currentUser: any;
  profileData: User;
  followErrorMsg: string;
  isFollowing: boolean;

  // targetImage;
  
  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }
  
  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.profileService.isFollowing.subscribe(_following => this.isFollowing = _following));
    
    // console.log(this.profileData)
    // console.log(this.profileData.profileImage)
    document.getElementById('test').setAttribute('src', `data:${this.profileData.profileImageType};charset-utf-8;base64,${this.profileData.profileImage}`)
    // this.targetImage = this.profileData.profileImage;
    // console.log(this.targetImage)
    // console.log(JSON.parse(this.targetImage.toString()))
    // console.log(this.targetImage.toString('base64'))
    // this.pondFile = 'this.profileData.profileImage';
    // this.pondFile = this.profileData.profileImage;
    // this.pondFile = `data:${this.profileData.imageType};base64,${this.profileData.profileImage}`;
    // console.log(this.targetImage.data)
    // console.log(`data:${this.profileData.profileImageType};charset-utf-8;base64,${this.targetImage.data}`)
    // this.target.setAttribute('src', `data:${this.profileData.profileImageType};charset-utf-8;base64,${this.targetImage.data}`)
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
    
// =====================
// || FilePond Values ||
// =====================

  @ViewChild('myPond') myPond: any;
  // pondFile;
  
  pondOptions = {
    class: 'my-filepond',
    labelIdle: 'Drop Image Here',
    imagePreviewHeight: 150,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 150,
    ImageResizeTargetHeight: 150,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleButtonRemoveItemPosition: 'center bottom',
    credits: false,
    acceptedFileTypes: 'image/jpeg, image/png'
  }

  pondHandleAddFile(event: any) {
    const file = this.myPond.getFile();
    const base64Image = file.getFileEncodeBase64String();
    const bufferImage = Buffer.Buffer.from(base64Image, 'base64');
    const check = file.getFileEncodeDataURL();
    const type = check.split(';')[0].split(':')[1];
    const payload = {
      id: this.profileData._id,
      username: this.profileData.username,
      profileImage: base64Image,
      imageType: type
    };
    
    console.log(typeof(check))
    // this.target.setAttribute('src', `data:${this.profileData.profileImageType};base64,${this.profileData.profileImage}`);
    // const target = document.getElementById('test').setAttribute('src', `data:${type};charset-utf-8;base64,${base64Image}`)
    
    this.profileService.updateProfileImage(payload).subscribe(_status => {
      if (!!_status) console.log(_status);
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
