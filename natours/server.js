const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION SHUTTING DOWN...');
  console.log(err.name, err.message);

  // THIS will abruptly shuts all requests going on which is not good
  //this is m synchronus code ,  we dont need server , and exit abruptly
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('DB connection successful'));

console.log(process.env.PORT);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});
// when the promise is being rejected anywhere in the code will be handled heere
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION SHUTTING DOWN');
  console.log(err.name, err.message);
  // THIS will abruptly shuts all requests going on which is not good
  //process.exit(1);
  server.close(() => {
    // 1 for uncaught rejections
    process.exit(1);
  });
});
