const mongoose = require('mongoose');

const DB_URL = 'mongodb://0.0.0.0:27017/gfi-notifier-db-main';

const connectDatabase = async () => {
    try {
      await mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("connected to database");
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
};

module.exports = connectDatabase;