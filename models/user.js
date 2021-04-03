const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  posts: [
    mongoose.Schema({
      timestamp: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      likes: {
        type: Number,
        default: 0
      },
      dislikes: {
        type: Number,
        default: 0
      },
      opinions: {}
    })
  ],
  followerCount: {
    type: Number,
    default: 0
  },
  followers: {},
  following: {}
})

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
  const query = {username: username};
  User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
}

// Test Below

// module.exports.findUsers = function(term, callback) {
//   const re = new RegExp(term);
//   const query = {username: re};
//   User.find(query, callback).select('username');
// }

module.exports.getSpecific = function(query, selection, callback) {
  User.find(query, callback).select(selection);
}

module.exports.addPost = function(newPost, callback) {
  const query = {
    $push: {
      posts: {
        $each: [newPost.content],
        $position: 0
      }
    }
  };
  const options = {new: true};
  User.findByIdAndUpdate(newPost.userId, query, options, callback);
}

module.exports.postOpinion = function(post, callback) {
  const filter = {
    username: post.profileUsername,
    "posts._id": post.postId
  };

  const query = {
    $set: {
      [`posts.$.opinions.${post.username}`]: post.opinion
    },
    $inc: {
      [`posts.$.${post.toChange}`]: post.changeAmount,
      [`posts.$.${post.toChangeOld}`]: post.changeAmountOld
    }
  };
  const options = { new: true };
  User.findOneAndUpdate(filter, query, options, callback);
}

module.exports.removePost = function(post, callback) {
  const query = {
    $pull: {
      posts: {
        _id: post.id
      }
    }
  };
  const options = {new: true};
  User.findOneAndUpdate({username: post.username}, query, options, callback);
}

module.exports.followed = function(currentUser, profileUser, callback) {
  const query = {
    $set: {
      [`followers.${currentUser.username}`]: {
        name: currentUser.name,
        username: currentUser.username
      }
    },
    $inc: {
      followerCount: 1
    }
  };
  const options = {new: true};
  User.findOneAndUpdate({username: profileUser.username}, query, options, callback);
}

module.exports.following = function(currentUser, profileUser, callback) {
  const query = {
    $set: {
      following: {
        [`${profileUser.username}`] : {
          name: profileUser.name,
          username: profileUser.username
        }
      }
    }
  };
  User.findOneAndUpdate({username: currentUser.username}, query, callback);
}

module.exports.unfollow = function(user, profile, callback) {
  const query = {
    $unset: {
      [`followers.${user.username}`]: ""
    },
    $inc: {
      followerCount: -1
    }
  };
  const options = {new: true};
  User.findOneAndUpdate({username: profile.username}, query, options, callback);
}

module.exports.removeFollowing = function(user, profile, callback) {
  const query = {
    $unset: {
      [`following.${profile.username}`]: ""
    }
  };
  User.findOneAndUpdate({username: user.username}, query, callback);
}
