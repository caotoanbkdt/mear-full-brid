const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');
const { check } = require('express-validator');
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
  likePost,
  dislikePost,
  postComment,
  deleteComment,
} = require('../../controllers/PostController');

// @route api/posts
router.post(
  '/',
  auth,
  check('text', 'field text is required').not().isEmpty(),
  createPost
);

router.get('/', auth, getAllPosts);

router.get('/:id', auth, getPost);

router.delete('/:id', auth, deletePost);

router.put('/likes/:id', auth, likePost);

router.put('/unlike/:id', auth, dislikePost);

router.post('/comments/:postId', auth, postComment);

router.delete('/comments/:postId/:commentId', auth, deleteComment);

module.exports = router;
