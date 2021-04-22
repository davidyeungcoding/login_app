import { Component, OnInit } from '@angular/core';

import { Post } from '../../../interfaces/post';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit {
  posts: Post[];
  private postCount: number;
  profileData: User;
  currentUser: any;
  toRemove: any = null;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.postService.currentPosts.subscribe(_posts => this.posts = _posts);
    this.postService.postCount.subscribe(_count => this.postCount = _count);
    this.authService.profileData.subscribe(_profile => this.profileData = _profile);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
  }

// =================
// || HTML Checks ||
// =================
  
  personalProfile(): boolean {
    return this.authService.personalProfile(this.currentUser, this.profileData);
  };

  endOfPosts(): boolean {
    return this.postCount === this.posts.length;
  };

// ====================
// || Like & Dislike ||
// ====================

  checkForOpinion(post: Post, value): boolean {
    if (this.currentUser.id && post.opinions && post.opinions[this.currentUser.username]) {
      return post.opinions[this.currentUser.username] === value;
    } else return false;
  };

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
      if (this.authService.isExpired()) this.authService.logout();
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
