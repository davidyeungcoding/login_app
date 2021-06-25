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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.authService.profileData.subscribe(_user => this.profileData = _user));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

// ===============================
// || Post Parsing for Mentions ||
// ===============================

  parsePost(post: string): any {
    const usernames = [];

    const resPost = post.split(' ').map(elem => {
      const userCheck = elem.match(/@\w+/g);
      
      if (userCheck) {
        userCheck.forEach(user => {
          usernames.push(user.substring(1));
          const target = `<a class="on-click" value="${user.substring(1)}">${user}</a>`;
          elem = elem.replace(user, target);
        });
      };
      return elem;
    });
    return { taggedUsers: usernames, post: resPost.join(' ') };
  };

// ==========================
// || Normal Post Handling ||
// ==========================

  clearPost(form: NgForm): void {
    $('#content').val('');
    form.value.content = '';
    $('#postModal').modal('hide');
  };

  async onAddPost(form: NgForm) {
    const postContent = form.value.content.trim();

    if (!postContent) {
      this.clearPost(form);
      return;
    };

    const parsedPostInfo = this.parsePost(postContent);

    const payload = {
      userId: this.profileData._id,
      username: this.profileData.username,
      name: this.profileData.name,
      followerCount: this.profileData.followerCount,
      content: {
        timestamp: new Date().toLocaleString(),
        // content: postContent
        content: parsedPostInfo.post
      },
      taggedUsers: parsedPostInfo.taggedUsers
    };
    
    this.postService.addPost(payload).subscribe(data => {
      if (data.success) {
        this.postService.changePost(data.msg.posts);
        this.postService.changePostCount(data.msg.postCount);
        this.profileData.postCount++;
      } else {
        // handle error
      }
    });
    // testing post list mutation check for adding links to users tagged: <a class="on-click" value="deleteme">@deleteme</a>
    this.clearPost(form);
  };
}
