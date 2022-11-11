import { timeStamp } from 'console';
import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
  {
    idAccount: {
      type: String,
      require: true,
    },
    idApartment: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.connection
  .useDb(process.env.DATABASE_NAME || '')
  .model('favorite', schema);
