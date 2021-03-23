import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Post } from '../../interfaces/post';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onAddPost(form: NgForm) {
    if (form.value.content) {
      this.postService.addPost(form).subscribe(data => {
        if (data.success) this.postService.changePost(data.msg.posts);
      });
      $('#content').val('');
      form.value.content = '';
      $('#postModal').modal('hide');
    };
  };

}
