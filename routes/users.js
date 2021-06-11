// =============
// || Express ||
// =============

const express = require('express');
const router = express.Router();

// ====================
// || JSON Web Token ||
// ====================

const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

// ============
// || Models ||
// ============

// const User = require('../models/user');
const user = require('../models/user');

module.exports = router;

// ======================
// || Global Functions ||
// ======================

const buildRegExp = userArray => {
  let regex = '';

  for (let i = 0; i < userArray.length; i++) {
    regex += i === 0 ? `^${userArray[i].username}$` : `|^${userArray[i].username}$`;
  };

  return regex;
};

// ====================
// || Create Account ||
// ====================

router.post('/register', (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    posts: [],
  });

  user.addUser(newUser, (err, user) => {
    err ? res.json({success: false, msg: `Failed to register user.`, err: err})
    : res.json({success: true, msg: `New user registered.`});
  });
})

// =============================
// || Authenticate Login Info ||
// =============================

router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  user.getUserForLogin(username, (err, _user) => {
    if (err) throw err;
    if (!_user) return res.json({success: false, msg: `User not found`});
    
    user.comparePassword(password, _user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(_user.toJSON(), config.secret, {expiresIn: '7d'});

        const resUser = {
          id: _user._id,
          username: _user.username,
          name: _user.name,
          email: _user.email
        };

        const profileData = {
          _id: _user._id,
          name: _user.name,
          username: _user.username,
          email: _user.email,
          bannerImage: _user.bannerImage,
          profileImage: _user.profileImage,
          followerCount: _user.followerCount,
          followers: _user.followers,
          followingCount: _user.followingCount,
          following: _user.following,
          postCount: _user.postCount,
          posts: _user.posts
        };

        const response = { success: true, token: `JWT ${token}`, user: resUser, profile: profileData };
        
        // ====================
        // || Follower Setup ||
        // ====================

        const following = profileData.following;
        const followingRegex = new RegExp(buildRegExp(following));
        const followers = profileData.followers;
        const followersRegex = new RegExp(buildRegExp(followers));

        if (following && following.length) {
          user.getProfilePreview(followingRegex, (err, _following) => {
            if (err) throw err;

            _following.forEach(preview => {
              if (preview.profileImage) preview.profileImage = preview.profileImage.buffer;
            });

            response.profile.following = _following;

            if (followers && followers.length) {
              user.getProfilePreview(followersRegex, (err, _followers) => {
                if (err) throw err;

                _followers.forEach(preview => {
                  if (preview.profileImage) preview.profileImage = preview.profileImage.buffer;
                });

                response.profile.followers = _followers;
                return res.json(response);
              });
            } else return res.json(response)
          })
        } else if (followers && followers.length) {
          user.getProfilePreview(followersRegex, (err, _followers) => {
            if (err) throw err;

            _followers.forEach(preview => {
              if (preview.profileImage) preview.profileImage = preview.profileImage.buffer;
            });

            response.profile.followers = _followers;
            return res.json(response);
          })
        } else return res.json(response);
      } else {
        return res.json({success: false, msg: 'Username and password do not match.'});
      };
    });
  });
})

// ================
// || Search Bar ||
// ================

router.get('/search', (req, res, next) => {
  const term = new RegExp(req.query.term);
  const start = Number(req.query.start);
  user.loadMoreSearchResults(term, start, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({ success: true, msg: doc })
    : res.json({ success: false, msg: 'Unable to retrieve data' });
  });
});

// ==================
// || Profile Page ||
// ==================

router.get('/profile/:username', (req, res, next) => {
  const profileUsername = req.params.username;
  const currentUsername = req.query.currentUsername;
  const currentId = req.query.currentId;

  user.getUserByUsername(profileUsername, (err, profile) => {
    if (err) throw err;
    if (profile) {

      // ====================
      // || Follower Setup ||
      // ====================

      let followers = profile.followers;
      const followersRegex = new RegExp(buildRegExp(followers));
      
      if (followers && followers.length) {
        user.getProfilePreview(followersRegex, (err, _followers) => {
          if (err) throw err;
          profile.followers = _followers;
        });
      };
      
      // =====================
      // || Following Setup ||
      // =====================

      let following = profile.following;
      const followingRegex = new RegExp(buildRegExp(following));
      
      if (following && following.length) {
        user.getProfilePreview(followingRegex, (err, _following) => {
          if (err) throw err;
          profile.following = _following;
        });
      };

      user.isFollowing(currentUsername, currentId, profileUsername, (err, doc) => {
        if (err) throw err;
        return doc ? res.json({ success: true, user: profile, follower: true })
        : res.json({ success: true, user: profile, follower: false });
      });
    } else {
      res.json({ success: false, msg: `Unable to retrieve user profile for ${profileUsername}`});
    };
  });
});

router.get('/profile/:username/loadmoreposts', (req, res, next) => {
  const username = req.params.username;
  const start = Number(req.query.start);
  user.loadMorePosts(username, start, (err, doc) => {
    if (err) throw err;
    doc ? res.json({success: true, msg: doc.posts, count: doc.postCount})
    : res.json({ success: false, msg: 'No posts found' })
  });
});

router.get('/profile/:username/loadmore', (req, res, next) => {
  const username = req.params.username;
  const start = Number(req.query.start);
  const target = req.query.list;

  user.loadMore(username, start, target, (err, doc) => {
    if (err) throw err;
    const list = target === 'followers' ? doc.followers : doc.following;
    const count = target === 'followers' ? doc.followerCount : doc.followingCount;

    if (doc && list && list.length) {
      const regex = new RegExp(buildRegExp(list));

      user.getProfilePreview(regex, (err, _list) => {
        if (err) throw err;

        for (let i = 0; i < _list.length; i++) {
          if (_list[i].profileImage) _list[i].profileImage = _list[i].profileImage.buffer;
        };

        return res.json({ success: true, msg: _list, count: count});
      });
    } else res.json({ success: false, msg: 'end of list'});
  });
});

router.post('/profile/:username/image', (req, res, next) => {
  let payload = {
    id: req.body.id,
    username: req.body.username,
  };

  if (req.body.bannerImage) payload.bannerImage = req.body.bannerImage;
  if (req.body.profileImage) payload.profileImage = req.body.profileImage;

  user.updateProfileImage(payload, (err, doc) => {
    if (err) throw err;
    doc ? res.json({ success: true, msg: 'Image successfully added'})
    : res.json({ success: false, msg: 'Failed to upload image' });
  });
});

// ===========
// || Posts ||
// ===========

router.get('/profile/:username/post', (req, res, next) => {
  const username = req.params.username;
  const query = {username: username};
  user.getSpecific(query, 'name username posts', (err, doc) => {
    if (err) throw err;
    doc ? res.json({ success: true, msg: doc})
    : res.json({ success: false, msg: 'No posts found' });
  });
});

router.put('/profile/:username/post', (req, res, next) => {
  user.addPost(req.body, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({success: true, msg: doc})
    : res.json({success: false, msg: "Faild to add post"})
  });
});

router.put("/profile/:username/post/remove", (req, res, next) => {
  user.removePost(req.body, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({success: true, msg: doc})
    : res.json({success: false, msg: 'failed to remove post'});
  });
});

// ============================
// || Post: Likes & Dislikes ||
// ============================

router.put('/profile/:username/post/opinion', (req, res, next) => {
  user.postOpinion(req.body, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({success: true, msg: doc.posts})
    : res.json({success: false, msg: "faild to update post opinion"});
  });
});

// ================================
// || Profile: Follow & Unfollow ||
// ================================

router.put('/profile/:username/follow', (req, res, next) => {
  const follower = {
    userId: req.body.followerId,
    name: req.body.followerName,
    username: req.body.followerUsername
  };
  const profile = {
    userId: req.body.profileId,
    name: req.body.profileName,
    username: req.body.profileUsername
  };

  user.followed(follower, profile, (err, profileDoc) => {
    if (err) throw err;
    if (profileDoc) {
      user.following(follower, profile, (err, followerDoc) => {
        if (err) throw err;
        return followerDoc ? res.json({success: true, msg: profileDoc})
        : res.json({success: false, msg: `Failed to update following information for @${follower.username}, redirecting to profile page.`});
      });
    } else res.json({success: false, msg: `Unable to find profile informatoin for @${profile.username}, redirecting to profile page.`});
  });
});

router.put('/profile/:username/unfollow', (req, res, next) => {
  const follower = {
    userId: req.body.followerId,
    name: req.body.followerName,
    username: req.body.followerUsername
  };
  const profile = {
    userId: req.body.profileId,
    name: req.body.profileName,
    username: req.body.profileUsername
  };

  user.removeFollowing(follower, profile, (err, followerDoc) => {
    if (err) throw err;
    if (followerDoc) {
      user.unfollow(follower, profile, (err, profileDoc) => {
        if (err) throw err;
        return profileDoc ? res.json({success: true, msg: profileDoc})
        : res.json({success: false, msg: 'failed to find profile to unfollow'});
      });
    } else res.json({success: false, msg: 'did not find profile in following list'});
  });
});
