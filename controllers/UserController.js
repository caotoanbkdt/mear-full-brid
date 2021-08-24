const { validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
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

exports.verify = (req, res, next) => {
  res.send('success');
};
