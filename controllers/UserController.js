const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
const fetch = require('node-fetch');
const axios = require('axios');
const normalize = require('normalize-url');
const Profile = require('../models/Profile');
const { response } = require('express');

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    //check user exits
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User is exits' }] });
    }
    const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mp' });

    user = new User({ name, email, password, avatar });
    const salt = await bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = await jwt.sign(payload, config.get('jwtSecrect'), {
      expiresIn: '2 days',
    });
    res.status(201).json({ message: 'Create user success', token });
  } catch (error) {
    res
      .status(401)
      .json({ message: 'Create user fail', errors: error.message });
  }
};

// @route api/profile/me
// @des get profile for current user
// @access private

exports.getProfileMe = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    if (!profile) {
      return res
        .status(400)
        .json({ message: 'there is not exits profile for current user' });
    }

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'server is error' });
  }
};

exports.createProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // destructure the request
  const {
    website,
    skills,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook,
    // spread the rest of the fields we don't need to check
    ...rest
  } = req.body;

  // build a profile
  const profileFields = {
    user: req.user.id,
    website:
      website && website !== '' ? normalize(website, { forceHttps: true }) : '',
    skills: Array.isArray(skills)
      ? skills
      : skills.split(',').map((skill) => ' ' + skill.trim()),
    ...rest,
  };

  // Build socialFields object
  const socialFields = { youtube, twitter, instagram, linkedin, facebook };

  // normalize social fields to ensure valid url
  for (const [key, value] of Object.entries(socialFields)) {
    if (value && value.length > 0)
      socialFields[key] = normalize(value, { forceHttps: true });
  }
  // add to profileFields
  profileFields.social = socialFields;

  try {
    // Using upsert option (creates new doc if no match is found):
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

// @route api/profile/
// @des get all profile
// @access public

exports.getAllProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

// @route api/profile/user/:user_id
// @des get use by id
// @access public

exports.getUserById = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ message: 'not found profile' });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    // delete profile
    await Profile.findOneAndDelete({ user: req.user.id });

    //delete user
    await User.findOneAndDelete({ _id: req.user.id });

    res.send('delete success');
  } catch (error) {}
};

exports.addExperience = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, company, ...rest } = req.body;
  const newExp = { title, company, ...rest };
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(401).send('not authenticate');
    }

    profile.experience = profile.experience.filter(
      (exp) => exp.id != req.params.experience_id
    );

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

exports.addEducation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { school, degree, ...rest } = req.body;
  const newEdu = { school, degree, ...rest };
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error');
  }
};

exports.deleteEducation = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(401).send('not authenticate');
    }

    profile.education = profile.education.filter(
      (edu) => edu.id != req.params.edu_id
    );

    await profile.save();

    res.json(profile);
  } catch (error) {}
};

exports.getRespos = async (req, res) => {
  const uri = encodeURI(
    `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
  );

  const headerConfig = {
    headers: {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('github_token')}`,
    },
  };

  try {
    const response = await fetch(uri, headerConfig);
    const repos = await response.json();
    return res.json(repos);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

exports.verify = (req, res, next) => {
  res.send('success');
};
