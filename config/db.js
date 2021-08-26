const mongoose = require('mongoose');
const config = require('config');

module.exports = async () => {
  try {
    mongoose.connect(config.get('MONGO_URI'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('connect success');
  } catch (error) {
    console.log(error.message);
    // exit process with failure
    process.exit(1);
  }
};
