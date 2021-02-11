const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');

router.post('/register', (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
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

router.get('/profile', (req, res, next) => {
  res.send('Profile');
})

module.exports = router;
