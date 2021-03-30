import { Component, OnInit } from '@angular/core';

import { Post } from '../../interfaces/post';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-display-post',
  templateUrl: './display-post.component.html',
  styleUrls: ['./display-post.component.css']
})
export class DisplayPostComponent implements OnInit {
  posts: Post[];
  profileData: any;
  currentUser: any;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.postService.currentPosts.subscribe(_posts => this.posts = _posts);
    this.authService.profileData.subscribe(_profile => this.profileData = _profile);
    this.authService.currentUser.subscribe(_user => this.currentUser = _user);
  }
  
  checkForOpinion(post: Post, value): boolean {
    if (this.currentUser.id && post.opinions && post.opinions[this.currentUser.username]) {
      return post.opinions[this.currentUser.username] === value;
    } else return false;
  };

  onOpinionVoiced(post: Post, value: number): void {
    if (this.currentUser.id && !this.authService.isExpired()
    && this.currentUser.username !== this.profileData.username) {
      const guest = this.currentUser.username;
      let payload;
      // consider moving everything to the service to handle the 'work'

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
        let updatedPost = doc.msg.find(_post => _post._id === post._id);
        post.likes = updatedPost.likes;
        post.dislikes = updatedPost.dislikes;
        post.opinions = updatedPost.opinions;
      })
    } else {
      // handle expired token
    }
  }
}
