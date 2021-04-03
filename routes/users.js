const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');
const user = require('../models/user');

router.post('/register', (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    posts: []
  });

  User.addUser(newUser, (err, user) => {
    err ? res.json({success: false, msg: `Failed to register user.`, err: err})
    : res.json({success: true, msg: `New user registered.`});
  });
})

router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
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
  })
})

module.exports = router;

// Test Below

router.get('/profile/:username', (req, res, next) => {
  const username = req.params.username;
  user.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    return user ? res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        posts: user.posts
      }
    })
    : res.json({ success: false, msg: 'User not found' });
  });
});

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

router.post('/search', (req, res, next) => {
  const re = new RegExp(req.body.searchTerm);
  const query = {username: re};
  user.getSpecific(query, 'name username', (err, doc) => {
    if (err) throw err;
    return doc.length ? res.json({success: true, msg: doc})
    : res.json({success : false, msg: 'No matching users'});
  });
});

router.put('/profile/:username/post/opinion', (req, res, next) => {
  user.postOpinion(req.body, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({success: true, msg: doc.posts})
    : res.json({success: false, msg: "faild to update post opinion"});
  });
});

router.put("/profile/:username/post/remove", (req, res, next) => {
  user.removePost(req.body, (err, doc) => {
    if (err) throw err;
    return doc ? res.json({success: true, msg: doc.posts})
    : res.json({success: false, msg: 'failed to remove post'});
  });
});

router.put('/profile/:username/follow', (req, res, next) => {
  const follower = {
    name: req.body.followerName,
    username: req.body.followerUsername
  };
  const profile = {
    name: req.body.profileName,
    username: req.body.profileUsername
  };

  user.followed(follower, profile, (err, doc) => {
    if (err) throw err;
    if (doc) {
      user.following(follower, profile, (err, nestedDoc) => {
        if (err) throw err;
        return nestedDoc ? res.json({success: true, msg: doc.followers})
        : res.json({success: false, msg: 'Failed to update following information'});
      });
    } else res.json({success: false, msg: 'Failed to update follower information'});
  });
});

router.put('/profile/:username/unfollow', (req, res, next) => {
  const follower = {
    name: req.body.followerName,
    username: req.body.followerUsername
  };
  const profile = {
    name: req.body.profileName,
    username: req.body.profileUsername
  };

  user.unfollow(follower, profile, (err, profileDoc) => {
    if (err) throw err;
    if (profileDoc) {
      user.removeFollowing(follower, profile, (err, followingDoc) => {
        if (err) throw err;
        return followingDoc ? res.json({success: true, msg: profileDoc})
        : res.json({success: false, msg: 'Failed to remove followed user from following list'});
      });
    } else res.json({success: false, msg: 'Failed to unfollow profile'});
  });
});
