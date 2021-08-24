const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @router POST api/auth
// @des authenticate user and get token
// @Access Public

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'invalid authenticate' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ errors: { message: 'invalid authenticate' } });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = await jwt.sign(payload, config.get('jwtSecrect'), {
      expiresIn: 3600000,
    });
    res.json({ token });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('server error');
  }
};
