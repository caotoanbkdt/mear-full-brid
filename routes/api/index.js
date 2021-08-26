const express = require('express');
const rootRouter = express.Router();

const usersRoute = require('./users');
const authRoute = require('./auth');
const profileRoute = require('./profile');
const postsRoute = require('./posts');

rootRouter.use('/users', usersRoute);
rootRouter.use('/auth', authRoute);
rootRouter.use('/profile', profileRoute);
rootRouter.use('/posts', postsRoute);

rootRouter.use('/', (req, res, next) => {
  res.send('homepage');
});
module.exports = rootRouter;
