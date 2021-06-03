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
    imagePreviewHeight: 240,
    imageCropAspectRatio: '6:2',
    imageResizeTargetWidth: 720,
    imageResizeTargetHeight: 240,
    stylePanelLayout: 'compact',
    styleLoadIndicatorPosition: 'center bottom',
    credits: false,
    acceptedFileTypes: ['image/jpeg']
  };
  
  profileImageOptions = {
    class: 'my-filepond',
    labelIdle: 'Drag & Drop your file or <span class="filepond--label-action"> Browse </span>',
    imagePreviewWidth: 200,
    imageCropAspectRatio: '1:1',
    imageResizeTargetWidth: 200,
    stylePanelLayout: 'compact circle',
    styleLoadIndicatorPosition: 'center bottom',
    styleButtonRemoveItemPosition: 'center bottom',
    credits: false,
    acceptedFileTypes: ['image/jpeg']
  };

// ================================
// || Edit Profile Image Options ||
// ================================

  onEdit(): void {
    this.profileService.changeIsEditing(true);
    $('#initEdit').css('display', 'none');
    $('.profile-image-control').css('display', 'none');
    $('.image-container').css('padding-bottom', '0px');
    $('.pond-image-control').css('display', 'inline');
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
        if (payload.profileImage) this.profileService.assignProfileImage(payload.profileImage, $('.personal-profile-image'));
        if (payload.bannerImage) this.profileService.assignProfileImage(payload.bannerImage, $('#bannerImagePreview'));
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

  errorFollow(msg: string, redirect: boolean): void {
    this.followErrorMsg = msg;
    $('#followErrorMsg').css('display', 'inline');

    setTimeout(() => {
      $('#followErrorMsg').css('display', 'none');
      if (redirect) this.authService.handleRedirectProfile(this.currentUser.username, this.isEditing);
    }, 3000);
  };

  followerPayload(): any {
    return {
      followerId: this.currentUser.id,
      followerName: this.currentUser.name,
      followerUsername: this.currentUser.username,
      profileId: this.profileData._id,
      profileName: this.profileData.name,
      profileUsername: this.profileData.username
    };
  };

  onFollow(payload: any): void {
    this.authService.followUser(payload).subscribe(_user => {
      if (_user.success) {
        this.profileData.followerCount++;
        this.profileService.changeIsFollowing(true);
      } else {
        this.errorFollow(_user.msg, true);
      };
    });
  };

  onUnfollow(payload: any): void {
    this.authService.unfollow(payload).subscribe(_user => {
      if (_user.success) {
        this.profileData.followerCount--;
        this.profileService.changeIsFollowing(false);
      } else {
        this.errorFollow(_user.msg, true);
      };
    });
  };

  handleFollowAction() {
    if (this.authService.visitingProfile(this.currentUser, this.profileData) && !this.authService.isExpired()) {
      const payload = this.followerPayload();
      this.isFollowing ? this.onUnfollow(payload) : this.onFollow(payload);
    } else if (!!localStorage.getItem('id_token') && this.authService.isExpired()) {
      this.authService.redirectDump('/session-timed-out', 'session');
    } else if (!localStorage.getItem('id_token')) {
      this.errorFollow('You must be logged in before following.', false);
    };
  };
}
