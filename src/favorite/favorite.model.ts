import mongoose, { Schema } from 'mongoose';

const schema = new Schema(
  {
    email: {
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
