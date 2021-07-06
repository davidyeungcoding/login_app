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

const UserModel = require('../models/user');
const user = require('../models/user');

module.exports = router;

// ======================
// || Global Functions ||
// ======================

const buildRegExp = userArray => {
  let regex = '';

  for (let i = 0; i < userArray.length; i++) {
    let username = typeof(userArray[i]) === "string" ? userArray[i] : userArray[i].username;
    regex += i === 0 ? `^${username}$` : `|^${username}$`;
  };

  return regex;
};

const setProfileImage = async regex => {
  const res = await new Promise(resolve => {
    user.getProfilePreview(regex, (err, _userArray) => {
      if (err) throw err;

      _userArray.forEach(preview => {
        if (preview.profileImage) preview.profileImage = preview.profileImage.buffer;
      });

      resolve(_userArray);
    });
  });
  return res;
};

const assignRecentActivityImages = (list, images) => {
  let temp = {};

  images.forEach(profile => {
    if (profile.profileImage) temp[profile.username] = profile.profileImage;
  });

  list.forEach(profile => {
    if (temp[profile.username]) profile.profileImage = temp[profile.username];
  });

  return list;
};

// ====================
// || Create Account ||
// ====================

router.post('/register', (req, res, next) => {
  let newUser = new UserModel({
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
});

// =============================
// || Authenticate Login Info ||
// =============================

router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  user.getUserForLogin(username, (err, _user) => {
    if (err) throw err;
    if (!_user) return res.json({success: false, msg: `User not found.`});
    
    user.comparePassword(password, _user.password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) return res.json({success: false, msg: 'Username and password do not match.'});
      const token = jwt.sign(_user.toJSON(), config.secret, {expiresIn: '7d'});
      
      user.getUserProfile(_user.username, async (err, _profile) => {
        if (err) throw err;
        
        const resUser = {
          id: _profile[0]._id,
          username: _profile[0].username,
          name: _profile[0].name,
          email: _profile[0].email,
        };
        
        if (_profile[0].bannerImage) _profile[0].bannerImage = _profile[0].bannerImage.buffer;
        if (_profile[0].profileImage) _profile[0].profileImage = _profile[0].profileImage.buffer;
        const response = { success: true, token: `JWT ${token}`, user: resUser, profile: _profile[0] };
        
        // ===========================
        // || Profile Preview Setup ||
        // ===========================
        
        const followers = _profile[0].followers;
        const following = _profile[0].following;
        const mentions = _profile[0].mentions;
        const recentActivity = _profile[0].recentActivity;
        
        if (followers && followers.length) {
          const followersRegex = new RegExp(buildRegExp(followers));
          response.profile.followers = await setProfileImage(followersRegex);
        };
        
        if (following && following.length) {
          const followingRegex = new RegExp(buildRegExp(following));
          response.profile.following = await setProfileImage(followingRegex);
        };
        
        if (mentions && mentions.length) {
          const mentionsRegex = new RegExp(buildRegExp(mentions));
          const mentionsImages = await setProfileImage(mentionsRegex);
          response.profile.mentions = assignRecentActivityImages(mentions, mentionsImages);
        };
        
        if (recentActivity && recentActivity.length) {
          const recentActivityRegex = new RegExp(buildRegExp(recentActivity));
          const recentActivityImages = await setProfileImage(recentActivityRegex);
          response.profile.recentActivity = assignRecentActivityImages(recentActivity, recentActivityImages);
        };
  
        return res.json(response);
      });
    });
  });
});

router.get('/unique', (req, res, next) => {
  const username = req.query.username;

  user.getUserByUsername(username, (err, _user) => {
    if (err) throw err;
    return _user ? res.json(false) : res.json(true);
  });
});

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

  user.getUserByUsername(profileUsername, async (err, profile) => {
    if (err) throw err;
    if (!profile) res.json({ success: false, msg: `Unable to retrieve user profile for ${profileUsername}`});
    if (profile[0].bannerImage) profile[0].bannerImage = profile[0].bannerImage.buffer;
    if (profile[0].profileImage) profile[0].profileImage = profile[0].profileImage.buffer;

    // ===========================
    // || Profile Preview Setup ||
    // ===========================

    const followers = profile[0].followers;
    const following = profile[0].following;
    const mentions = profile[0].mentions;
    
    if (followers && followers.length) {
      const followersRegex = new RegExp(buildRegExp(followers));
      profile[0].followers = await setProfileImage(followersRegex);
    };
    
    if (following && following.length) {
      const followingRegex = new RegExp(buildRegExp(following));
      profile[0].following = await setProfileImage(followingRegex);
    };
    
    if (mentions && mentions.length) {
      const mentionsRegex = new RegExp(buildRegExp(mentions));
      const mentionsImages = await setProfileImage(mentionsRegex);
      profile[0].mentions = assignRecentActivityImages(mentions, mentionsImages);
    };
    
    // ========================
    // || Check if Following ||
    // ========================

    user.isFollowing(currentUsername, currentId, profileUsername, (err, doc) => {
      if (err) throw err;
      return doc ? res.json({ success: true, user: profile[0], follower: true })
      : res.json({ success: true, user: profile[0], follower: false });
    });
  });
});

router.get('/profile/:username/recentactivity', (req, res, next) => {
  const username = req.params.username;

  user.getRecentActivity(username, async (err, _list) => {
    if (err) throw err;
    if (!_list) res.json({ success: false, msg: "No activity found." });
    const list = _list.recentActivity;
    const regex = new RegExp(buildRegExp(list));
    let recentActivity = [];

    if (list.length) {
      const recentActivityImages = await setProfileImage(regex);
      recentActivity = assignRecentActivityImages(list, recentActivityImages);
    };

    res.json({ success: true, msg: recentActivity });
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

  user.loadMore(username, start, target, async (err, doc) => {
    if (err) throw err;
    if (!doc[0][target].length) return;
    const regex = new RegExp(buildRegExp(doc[0][target]));

    if (target === 'mentions') {
      const mentionsImages = await setProfileImage(regex);
      doc[0][target] = assignRecentActivityImages(doc[0][target], mentionsImages);
    } else doc[0][target] = await setProfileImage(regex);

    return res.json({ success: true, msg: doc[0][target], count: doc[0].count });
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
  user.addPost(req.body, (err, _posts) => {
    if (err) throw err;
    const payload = req.body.content;
    payload.userId = req.body.userId;
    payload.username = req.body.username;
    payload.name = req.body.name;
    payload.postId = _posts.posts[0]._id;
  
    // ==============================
    // || Add Post to Tagged Users ||
    // ==============================

    if (req.body.taggedUsers.length) {
      const usersRegex = new RegExp(buildRegExp(req.body.taggedUsers));
    
      user.addToMentions(usersRegex, payload, (err, doc) => {
        if (err) throw err;
      });
    };

    // =========================================
    // || Update recentActivity for Followers ||
    // =========================================

    if (req.body.followerCount) {
      user.retrieveFollowersList(req.body.username, (err, _followers) => {
        if (err) throw err;
        const regex = new RegExp(buildRegExp(_followers[0].followers));
        
        user.updateRecentActivity(regex, payload, (err, doc) => {
          if (err) throw err;
        });
      });
    };

    return _posts ? res.json({success: true, msg: _posts})
    : res.json({success: false, msg: "Faild to add post"})
  });
});

router.put("/profile/:username/post/remove", (req, res, next) => {
  user.removePost(req.body, (err, doc) => {
    if (err) throw err;
  
    // ==============================
    // || Add Post to Tagged Users ||
    // ==============================

    user.removeFromMentions(req.body, (err, doc) => {
      if (err) throw err;
    });

    // =========================================
    // || Update recentActivity for Followers ||
    // =========================================

    user.removeRecentActivity(req.body, (err, doc) => {
      if (err) throw err;
    });

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
