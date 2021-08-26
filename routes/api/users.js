const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, verify } = require('../../controllers/UserController');
const { auth } = require('../../middlewares/auth');
// @route api/user
router.post(
  '/registerUser',
  body('name').isLength({ min: 5 }),
  body('email').isEmail(),
  // password must be at least 5 chars long
  body('password').isLength({ min: 5 }),
  register
);

router.get('/verify', auth, verify);

module.exports = router;
