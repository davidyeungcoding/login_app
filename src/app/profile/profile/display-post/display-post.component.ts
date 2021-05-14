import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

import { Post } from '../../../interfaces/post';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { User } from '../../../interfaces/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private activeTab: string;
  private activeList: string;
  private toRemove: any = null;
  private postArray: any;
  private isEditing: boolean;
  posts: Post[];
  profileData: User;
  currentUser: any;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_profile => this.profileData = _profile));
    this.subscriptions.add(this.authService.currentUser.subscribe(_user => this.currentUser = _user));
    this.subscriptions.add(this.postService.currentPosts.subscribe(_posts => this.posts = _posts));
    this.subscriptions.add(this.profileService.activeTab.subscribe(_tab => this.activeTab = _tab));
    this.subscriptions.add(this.profileService.activeList.subscribe(_list => this.activeList = _list));
    this.subscriptions.add(this.postService.postArray.subscribe(_array => this.postArray = _array));
    this.subscriptions.add(this.profileService.isEditing.subscribe(_state => this.isEditing = _state));
  }

  ngAfterViewInit(): void {
    this.postService.changePostArray(document.getElementsByClassName('profile-image'));
    this.assignProfileImage();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

// =========================
// || Profile Image Setup ||
// =========================

  assignProfileImage(): void {
    const image = this.profileData.profileImage;
    const type = this.profileData.profileImageType;
    this.profileService.assignProfileImageMulti(image, type, this.postArray);
  };

// ====================
// || Like & Dislike ||
// ====================

  // checkForOpinion(post: Post, value): boolean {
  //   if (this.currentUser.id && post.opinions && post.opinions[this.currentUser.username]) {
  //     return post.opinions[this.currentUser.username] === value;
  //   } else return false;
  // };

  onOpinionVoiced(post: Post, value: number): void {
    if (this.authService.visitingProfile(this.currentUser, this.profileData)) {
      const guest = this.currentUser.username;
      let payload;

      if (post.opinions === undefined || post.opinions[guest] === undefined) {
        payload = {
          profileUsername: this.profileData.username,
          postId: post._id,
          username: guest,
          opinion: value,
          toChange: value === 1 ? 'likes' : 'dislikes',
          changeAmount: 1,
          toChangeOld: value === 1 ? 'dislikes' : 'likes',
          changeAmountOld: 0
        };
      } else {
        payload = {
          profileUsername: this.profileData.username,
          postId: post._id,
          username: guest,
          opinion: post.opinions[guest] === value ? 0 : value,
          toChange: value === 1 ? 'likes' : 'dislikes',
          changeAmount: post.opinions[guest] === value ? -1 : 1,
          toChangeOld: value === 1 ? 'dislikes' : 'likes',
          changeAmountOld: post.opinions[guest] === value || post.opinions[guest] === 0 ? 0 : -1
        };
      };
      
      this.postService.updateLikes(payload).subscribe(doc => {
        if (doc.success) {
          let updatedPost = doc.msg.find(_post => _post._id === post._id);
          post.likes = updatedPost.likes;
          post.dislikes = updatedPost.dislikes;
          post.opinions = updatedPost.opinions;
        } else {
          // handle error
        }
      });
    } else {
      // handle isexpired
      if (this.authService.isExpired()) this.authService.logout(this.activeTab, this.activeList, this.isEditing);
    };
  };

// =================
// || Delete Post ||
// =================

  deletePost(): void {
    const payload = {
      username: JSON.parse(localStorage.getItem('user')).username,
      id: this.toRemove._id
    };

    this.postService.deletePost(payload).subscribe(doc => {
      if (doc.success) {
        this.postService.changePost(doc.msg.posts);
        this.postService.changePostCount(doc.msg.postCount);
        this.profileData.postCount--;
      } else {
        // handle error
      };
    });
    // may need to move based on how we deal with the error
    this.clearDeleteRequest();
  };

  markForDeletion(post: Post): void {
    this.toRemove = post;
  };
  
  clearDeleteRequest(): void {
    this.toRemove = null;
    $('#deleteConfirmation').modal('hide');
  };
}
