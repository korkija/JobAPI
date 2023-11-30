const mongoose = require('mongoose');

const connectionDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log('MongoDB database connected with host ', con.connection.host);
    })
    .catch((err) => {
      console.log('MongoDB ERROR ->', err);
    });
};

module.exports = connectionDatabase;
