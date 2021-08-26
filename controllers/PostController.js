const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: { errors: errors.array() } });
  }

  try {
    const user = await User.findById(req.user.id);
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });

    await newPost.save();

    return res.status(201).json(newPost);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: 'Not found post' });
    }

    res.json(post);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: 'Not found post' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'not authenticated' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.log(error.message);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Not found post' });
    }
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length !== 0
    ) {
      return res.json({ msg: 'you had liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.status(201).json('liked');
  } catch (error) {
    console.log(error.message);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Not found post' });
    }
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: 'Not found post' });
    }

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(401).json({ msg: 'you have not liked it' });
    }

    // get index to remove
    const idx = post.likes.findIndex(
      (like) => like.user.toString() === req.user.id
    );
    post.likes.splice(idx, 1);
    await post.save();

    return res.json({ msg: 'dislike success' });
  } catch (error) {
    console.log(error.message);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Not found post' });
    }
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.postComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(400).json({ msg: 'Not found post' });
    }

    const user = await User.findById(req.user.id);

    const newComment = {
      user: req.user.id,
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
    };

    post.comments.unshift(newComment);

    await post.save();

    return res.status(201).json('add comment success');
  } catch (error) {
    console.log(error.message);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Not found post' });
    }
    return res.status(500).json({ message: 'Server is error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(400).json({ msg: 'Not found post' });
    }

    // find comment
    const comment = post.comments.find(
      (comment) => comment.id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(400).json({ msg: 'Not found comment' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: 'Not authenticated' });
    }

    //find Index
    const idx = post.comments.findIndex(
      (comment) => comment.id.toString() === req.params.commentId
    );

    post.comments.splice(idx, 1);

    await post.save();

    return res.json({ msg: 'delete success comment' });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Server is error' });
  }
};
