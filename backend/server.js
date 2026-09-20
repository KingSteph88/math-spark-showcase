require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');
const { startSubscriptionExpiryJob } = require('./src/jobs/expireSubscriptions');

const start = async () => {
  await connectDB();
  try {
    await app.listen({ port: process.env.PORT || 5000, host: '0.0.0.0' });
    console.log('Server running');
    startSubscriptionExpiryJob();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
