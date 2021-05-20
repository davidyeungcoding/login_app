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

const User = require('../models/user');
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

  user.getUserForLogin(username, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({success: false, msg: `User not found`});
    
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(user.toJSON(), config.secret, {expiresIn: '7d'});

        res.json({
          success: true,
          token: `JWT ${token}`,
          user: {
            id: user._id,
            username: user.username,
            name: user.name,
            email: user.email
          }
        });
      } else {
        return res.json({success: false, msg: 'Username and password do not match.'});
      };
    });
  });
})

// ================
// || Search Bar ||
// ================

router.post('/search', (req, res, next) => {
  const term = new RegExp(req.body.searchTerm);
  const start = Number(req.query.start);
  user.loadMoreSearchResults(term, start, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({ success: true, msg: doc })
    : res.json({ success: false, msg: 'No results found' });
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

router.get(`/profile/:username/loadmorefollowers`, (req, res, next) => {
  const username = req.params.username;
  const start = Number(req.query.start);
  user.loadMoreFollowers(username, start, (err, doc) => {
    if (err) throw err;

    if (doc) {
      const regex = new RegExp(buildRegExp(doc.followers));
      
      if (doc.followers && doc.followers.length) {
        user.getProfilePreview(regex, (err, _followers) => {
          if (err) throw err;
          return res.json({ success: true, msg: _followers, count: doc.followerCount });
        });
      } else return res.json({ success: false, msg: 'No followers found'});
    };
  });
});

router.get('/profile/:username/loadmorefollowing', (req, res, next) => {
  const username = req.params.username;
  const start = Number(req.query.start);
  user.loadMoreFollowing(username, start, (err, doc) => {
    if (err) throw err;
    doc ? res.json({ success: true, msg: doc.following, count: doc.followingCount })
    : res.json({ success: false, msg: 'No additional followed profiles'});
  });
});

router.post('/profile/:username/image', (req, res, next) => {
  user.updateProfileImage(req.body, (err, doc) => {
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
