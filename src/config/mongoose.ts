import mongoose from 'mongoose';

export function initMongoose() {
  mongoose.set('strictQuery', false);
  return mongoose.connect(process.env.DB_URL, {
    appName: 'Rule 34 Clone',
  });
}
