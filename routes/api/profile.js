const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');
const { check } = require('express-validator');
const {
  getProfileMe,
  createProfile,
  getAllProfile,
  getUserById,
  deleteProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  getRespos,
} = require('../../controllers/UserController');

router.get('/me', auth, getProfileMe);
router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'skill is required').not().isEmpty(),
    ],
  ],
  createProfile
);

router.get('/', getAllProfile);

router.get('/user/:user_id', getUserById);

router.delete('/', auth, deleteProfile);

router.put(
  '/experience',
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is requied').not().isEmpty(),
  ],
  addExperience
);

router.delete('/experience/:experience_id', auth, deleteExperience);

router.put(
  '/education',
  auth,
  [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is requied').not().isEmpty(),
  ],
  addEducation
);

router.delete('/education/:edu_id', auth, deleteEducation);

// route api/profile/github/:username

router.get('/github/:username', getRespos);

module.exports = router;
