const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../../middlewares/auth');
const { getUser, login } = require('../../controllers/AuthController');

// @route api/auth
router.get('/', auth, getUser);
router.post(
  '/',
  body('email').isEmail(),
  // password must be at least 5 chars long
  body('password').isLength({ min: 5 }),
  login
);
module.exports = router;
