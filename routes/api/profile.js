const express = require('express');
const router = express.Router();
const { hompePage } = require('../../controllers/UserController');

// @route api/profile
router.get('/', hompePage);

module.exports = router;
