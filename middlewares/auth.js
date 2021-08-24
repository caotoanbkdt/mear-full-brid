const jwt = require('jsonwebtoken');
const config = require('config');
exports.auth = async (req, res, next) => {
  // const authorization = req.headers.authorization;
  const token = req.header('x-auth-token');
  // const token = authorization.split(' ')[1];
  try {
    const decoded = await jwt.verify(token, config.get('jwtSecrect'));

    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ errors: { message: 'token is not valid' } });
  }
};
