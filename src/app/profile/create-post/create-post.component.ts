import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
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

  constructor(
    private postService: PostService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

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
