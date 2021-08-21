const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const connectDb = require('./config/db');
const rootRouter = require('./routes/api');
connectDb();

app.use('/', rootRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
