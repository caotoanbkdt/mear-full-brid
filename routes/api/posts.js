const express = require('express');
const router = express.Router();
const { hompePage } = require('../../controllers/UserController');

// @route api/posts
router.get('/', hompePage);

module.exports = router;