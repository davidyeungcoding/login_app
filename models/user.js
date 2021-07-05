const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// =====================
// || Global Variable ||
// =====================
const step = 1;

const fullProfile = {
  username: 1,
  name: 1,
  password: 1,
  bannerImage: 1,
  profileImage: 1,
  email: 1,
  postCount: 1,
  posts: {
    $slice: ["$posts", 0, step]
  },
  followerCount: 1,
  followers: {
    $slice: ["$followers", 0, step]
  },
  followingCount: 1,
  following: {
    $slice: ["$following", 0, step]
  },
  recentActivity: 1,
  mentions: {
    $slice: ["$mentions", 0, step]
  },
  mentionsCount: {
    $cond: {
      if: {
        $isArray: "$mentions"
      },
      then: {
        $size: "$mentions"
      },
      else: 0
    }
  }
};

// =============
// || Schemas ||
// =============

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
  },
  profileImage: {
    type: Buffer
  }
}, {_id: false})

const Post = mongoose.Schema({
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

const ActivityPost = mongoose.Schema({
  postId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    retuired: true
  },
  timestamp: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  profileImage: {
    type: Buffer
  }
}, {_id: false})

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
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
  bannerImage: {
    type: Buffer
  },
  profileImage: {
    type: Buffer
  },
  postCount: {
    type: Number,
    default: 0
  },
  posts: [Post],
  recentActivity: [ActivityPost],
  mentions: [ActivityPost],
  followerCount: {
    type: Number,
    default: 0
  },
  followers: [MiniUser],
  followingCount: {
    type: Number,
    default: 0
  },
  following: [MiniUser]
})

const User = module.exports = mongoose.model('User', UserSchema);

// ==========================
// || Get User Information ||
// ==========================

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserForLogin = function(username, callback) {
  const selection = {
    _id: 0,
    username: 1,
    password: 1
  };
  User.findOne({ username: username }, selection, callback);
}

module.exports.getUserProfile = (username, callback) => {
  User.aggregate([{$match: {username: username}}, {$project: fullProfile}], callback);
}

module.exports.getUserByUsername = function(username, callback) {
  const selection = {
    posts: {
      $slice: [0, step]
    },
    followers: {
      $slice: [0, step]
    },
    following: {
      $slice: [0, step]
    },
    password: 0
  };
  User.findOne({ username: username }, selection, callback);
}

module.exports.getSpecific = function(query, selection, callback) {
  User.find(query, callback).select(selection);
}

module.exports.loadMoreSearchResults = function(term, start, callback) {
  const selection = {
    username: 1,
    name: 1,
    followerCount: 1,
    profileImage: 1
  };
  User.find({username: term}, selection, callback).skip(start).limit(step);
}

module.exports.getProfilePreview = function(regex, callback) {
  const selection = {
    userId: `$_id`,
    name: 1,
    username: 1,
    profileImage: 1
  };
  User.aggregate([{$match: {username: regex}}, {$project: selection}], callback);
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

// ===============
// || Post Data ||
// ===============

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

  const options = {
    new: true,
    useFindAndModify: false,
    projection: {
      postCount: 1,
      posts: {
        $slice: [0, step]
      },
      _id: 0
    }
  };

  User.findByIdAndUpdate(newPost.userId, query, options, callback);
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

  const options = {
    new: true,
    useFindAndModify: false,
    projection: {
      postCount: 1,
      posts: {
        $slice: [0, step]
      },
      _id: 0
    }
  };

  User.findOneAndUpdate({username: post.username}, query, options, callback);
}

module.exports.addToMentions = (usersRegex, payload, callback) => {
  const update = {
    $push: {
      mentions: {
        $each: [payload],
        $position: 0
      }
    }
  };

  User.updateMany({username: usersRegex}, update, callback);
}

module.exports.removeFromMentions = (payload, callback) => {
  const update = {
    $pull: {
      mentions: {
        postId: payload.id
      }
    }
  };

  User.updateMany({"mentions.postId": payload.id}, update, callback);
}

module.exports.updateRecentActivity = (regex, content, callback) => {
  const update = {
    $push: {
      recentActivity: {
        $each: [content],
        $position: 0,
        $slice: 10
      }
    }
  }
  User.updateMany({username: regex}, update, callback);
}

module.exports.removeRecentActivity = (payload, callback) => {
  const update = {
    $pull: {
      recentActivity: {
        postId: payload.id
      }
    }
  };

  User.updateMany({"recentActivity.postId": payload.id}, update, callback);
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

module.exports.loadMorePosts = function(username, start, callback) {
  const selection = {
    posts: {
      $slice: [start, step]
    }
  };
  User.findOne({username: username}, selection, callback);
}

module.exports.loadMore = function(username, start, target, callback) {
  const selection = {
    _id: 0,
    [`${target}`]: {
      $slice: [`$${target}`, start, step]
    },
    count: {
      $cond: {
        if: {
          $isArray: `$${target}`
        },
        then: {
          $size: `$${target}`
        },
        else: 0
      }
    }
  };
  User.aggregate([{$match: {username: username}}, {$project: selection}], callback);
}

module.exports.getRecentActivity = (username, callback) => {
  User.findOne({username: username}, {_id: 0, recentActivity: 1}, callback);
}

// ==========================
// || Follower & Following ||
// ==========================

module.exports.isFollowing = function(currentUsername, currentId, profileUser, callback) {
  const filter = {
    username: profileUser,
    "followers.username": currentUsername,
    "followers.userId": currentId
  };
  User.findOne(filter, callback);
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
    },
    $inc: {
      followingCount: 1
    }
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
    },
    $inc: {
      followingCount: -1
    }
  };
  User.findOneAndUpdate(filter, query, callback);
}

module.exports.retrieveFollowersList = (username, callback) => {
  User.find({username: username}, {_id: 0, 'followers.username': 1}, callback);
}

// ============
// || Images ||
// ============

module.exports.updateProfileImage = (payload, callback) => {
  const filter = {
    _id: payload.id,
    username: payload.username
  };

  const query = { $set: {} };
  if (payload.bannerImage) query.$set.bannerImage = payload.bannerImage;
  if (payload.profileImage) query.$set.profileImage = payload.profileImage;
  User.findOneAndUpdate(filter, query, callback);
}
