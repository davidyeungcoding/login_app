import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private profileData: User;
  private postArray: any;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
    this.subscriptions.add(this.postService.postArray.subscribe(_array => this.postArray = _array));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // assignProfileImage(): void {
  //   const image = this.profileData.profileImage;
  //   const type = this.profileData.profileImageType;
  //   this.profileService.assignProfileImageMulti(image, type, this.postArray);
  // };

  // updatePostArray(array) {
  //   this.postService.changePostArray(array);
  // };

  onAddPost(form: NgForm) {
    if (form.value.content) {
      this.postService.addPost(form).subscribe(data => {
        if (data.success) {
          this.postService.changePost(data.msg.posts);
          this.postService.changePostCount(data.msg.postCount);
          this.profileData.postCount++;
        } else {
          // handle error
        }
      });
      $('#content').val('');
      form.value.content = '';
    };
    $('#postModal').modal('hide');
  };
}
