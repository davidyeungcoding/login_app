import { Post } from './post';
import { ProfilePreview } from './profile-preview';

export interface User {
  _id: string,
  username: string,
  name: string,
  profileImage: any,
  profileImageType: string,
  email: string,
  postCount: number,
  posts: Post[],
  followerCount: number,
  followers: ProfilePreview[],
  followingCount: number,
  following: ProfilePreview[]
}
