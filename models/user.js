const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

const MiniUser = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
})

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
  postCount: {
    type: Number,
    default: 0
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
  followers: [MiniUser],
  following: [MiniUser]
  // followers: {},
  // following: {}
})

const User = module.exports = mongoose.model('User', UserSchema);

// ===============================
// || Get Full User Information ||
// ===============================

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
  const filter = {username: username};
  const query = {
    posts: {
      $slice: [0, 25]
    }
  };
  User.findOne(filter, query, callback);
}

// =======================
// || Authenticate User ||
// =======================

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
}

// ==================
// || Add New User ||
// ==================

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.getSpecific = function(query, selection, callback) {
  User.find(query, callback).select(selection);
}

module.exports.addPost = function(newPost, callback) {
  const query = {
    $inc: {
      postCount: 1
    },
    $push: {
      posts: {
        $each: [newPost.content],
        $position: 0
      }
    }
  };
  const options = {new: true};
  User.findByIdAndUpdate(newPost.userId, query, options, callback).select('posts postCount');
}

module.exports.removePost = function(post, callback) {
  const query = {
    $inc: {
      postCount: -1
    },
    $pull: {
      posts: {
        _id: post.id
      }
    }
  };
  const options = {new: true};
  User.findOneAndUpdate({username: post.username}, query, options, callback).select('posts postCount');
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

module.exports.followed = function(currentUser, profileUser, callback) {
  const filter = {
    _id: profileUser.userId,
    username: profileUser.username
  };

  const query = {
    $push: {
      followers: {
        $each: [{
          userId: currentUser.userId,
          name: currentUser.name,
          username: currentUser.username
        }],
        $sort: {username: 1}
      }
    },
    // $set: {
    //   [`followers.${currentUser.username}`]: {
    //     userId: currentUser.userId,
    //     name: currentUser.name,
    //     username: currentUser.username
    //   }
    // },
    $inc: {
      followerCount: 1
    }
  };
  const options = {new: true};
  User.findOneAndUpdate(filter, query, options, callback);
}

module.exports.following = function(currentUser, profileUser, callback) {
  const filter = {
    _id: currentUser.userId,
    username: currentUser.username
  };

  const query = {
    $push: {
      following: {
        $each: [{
          userId: profileUser.userId,
          name: profileUser.name,
          username: profileUser.username
        }],
        $sort: {username: 1}
      }
    }
    // $set: {
    //   [`following.${profileUser.username}`] : {
    //     userId: profileUser.userId,
    //     name: profileUser.name,
    //     username: profileUser.username
    //   }
    // }
  };
  User.findOneAndUpdate(filter, query, callback);
}

module.exports.unfollow = function(user, profile, callback) {
  const filter = {
    _id: profile.userId,
    username: profile.username
  };

  const query = {
    $pull: {
      followers: {
        userId: user.userId,
        username: user.username
      }
    },
    // $unset: {
    //   [`followers.${user.username}`]: ""
    // },
    $inc: {
      followerCount: -1
    }
  };
  const options = {new: true};
  User.findOneAndUpdate(filter, query, options, callback);
}

module.exports.removeFollowing = function(user, profile, callback) {
  const filter = {
    _id: user.userId,
    username: user.username,
  };

  const query = {
    $pull: {
      following: {
        userId: profile.userId,
        username: profile.username
      }
    }
    // $unset: {
    //   [`following.${profile.username}`]: ""
    // }
  };
  User.findOneAndUpdate(filter, query, callback);
}

module.exports.loadMorePosts = function(username, start, callback) {
  const query = {
    posts: {
      $slice: [start, 25]
    }
  };
  User.findOne({username: username}, query, callback);
};
