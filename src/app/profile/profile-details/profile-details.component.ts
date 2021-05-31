import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

import { User } from '../../interfaces/user';
import { Subscription } from 'rxjs';
import * as buffer from 'buffer';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private isEditing: boolean;
  currentUser: any;
  profileData: User | undefined;
  followErrorMsg: string;
  isFollowing: boolean;
  
  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) { }
  
  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.profileService.isFollowing.subscribe(_following => this.isFollowing = _following));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
  }
  
  ngAfterViewInit(): void {
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.authService.changeProfileData(undefined);
    if (this.isEditing) this.profileService.resetEditState();
  }
    
// =====================
// || FilePond Values ||
// =====================

  @ViewChild('pondProfile') pondProfile: any;
  @ViewChild('pondBanner') pondBanner: any;

  bannerOptions = {
    class: 'my-filepond',
    labelIdle: 'Drag & Drop your file or <span class="filepond--label-action"> Browse </span>',
    imagePreviewWidth: 720,
    imageCropAspectRatio: '4:1',
    imageResizeTargetWidth: 720,
    stylePanelLayout: 'compact',
    styleLoadIndicatorPosition: 'center bottom',
    credits: false,
    acceptedFileTypes: ['image/jpeg', 'image/png']
  }
  
  profileImageOptions = {
    class: 'my-filepond',
    labelIdle: 'Drag & Drop your file or <span class="filepond--label-action"> Browse </span>',
    imagePreviewWidth: 150,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 150,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleButtonRemoveItemPosition: 'center bottom',
    credits: false,
    acceptedFileTypes: ['image/jpeg', 'image/png']
  }

  pondHandleAddFile() { // IMPORTANT: to be removed from component
    // consider removing this and create the payload in save()
    // const bannerFile = this.pondBanner.getFile();
    // const bannerCheck = bannerFile.getFileEncodeDataURL();
    // const banner64 = bannerFile.getFileEncodeBase64String();
    // const profileFile = this.myPond.getFile();
    // const profileCheck = profileFile.getFileEncodeDataURL();
    // const profile64 = profileFile.getFileEncodeBase64String();

    // const file = pondFile.getFile();
    // const check = file.getFileEncodeDataURL();
    // this.base64Image = file.getFileEncodeBase64String();
    // this.type = check.split(';')[0].split(':')[1];
    
    // this.imagePayload = {
    //   id: this.profileData._id,
    //   username: this.profileData.username,
    //   profileImage: buffer.Buffer.from(this.base64Image),
    //   imageType: this.type
    // };

    // console.log(this.pondBanner.getFile().getFileEncodeDataURL())
    // console.log(!!this.pondProfile.getFile())
  //   console.log(this.buildPayload());
  };

// ================================
// || Edit Profile Image Options ||
// ================================

  onEdit(): void {
    this.profileService.changeIsEditing(true);
    $('#initEdit').css('display', 'none');
    $('#profileImagePreview').css('display', 'none');
    $('#filePondProfileImage').css('display', 'inline');
    $('.resolveEdit').css('display', 'inline');
  };

  buildPayload(): any {
    let payload: any = {
      id: this.profileData._id,
      username: this.profileData.username
    };

    const profileFile = this.pondProfile.getFile();
    const bannerFile = this.pondBanner.getFile();
    if (!profileFile && !bannerFile) return false;
    if (profileFile) payload.profileImage = buffer.Buffer.from(profileFile.getFileEncodeDataURL());
    if (bannerFile) payload.bannerImage = buffer.Buffer.from(bannerFile.getFileEncodeDataURL());
    return payload;
  };
  
  onSave(): void {
    const payload = this.buildPayload();
    this.profileService.resetEditState();
    if (!payload) return;

    this.profileService.updateProfileImage(payload).subscribe(_status => {
      if (_status.success) {
        // IMPORTANT: rework below code to account for new profile and banner image handling
        if (payload.profileImage) this.profileService.assignPostProfileImage(payload.profileImage, $('.personal-profile-image'));
      } else {
        // handle failed upload
      };
    });
  };
  
  onCancel(): void {
    this.profileService.resetEditState();
  };
    
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
            this.authService.handleRedirectProfile(this.currentUser.username, this.isEditing);
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
            this.authService.handleRedirectProfile(this.currentUser.username, this.isEditing);
          }, 4000);
        };
      });
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    };
  };
}
