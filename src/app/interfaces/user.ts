import { Post } from './post';

export interface User {
  _id: string,
  username: string,
  name: string,
  email: string,
  postCount: number,
  posts: Post[],
  followerCount: number,
  followers: object,
  following: object
}
