import mongoose, { Schema, Document } from 'mongoose';
import Apartment from './apartment.interface';
import 'dotenv/config';

const apartmentSchema = new Schema(
  {
    name: { type: String, require: true },
    address: { type: String, require: true },
    price: { type: String, require: true },
    sqrt: { type: String, require: true },
    description: { type: String, require: true },
    photos: { type: Array, require: true },
    countVisit: { type: Number, default: 1 },
    lat: { type: Number, require: true },
    lng: { type: Number, require: true },
    isDisplay: { type: Boolean, default: true },
    contactPhoneNumber: { type: String, require: true },
    sumBedroom: { type: String, require: true },
    sumToilet: { type: String, require: true },
    createBy: { type: String, require: true },
    idOwner: { type: String, require: true },
  },
  { timestamps: true }
);

interface ApartmentDocument extends Apartment, Document {}

export default mongoose.connection
  .useDb(process.env.DATABASE_NAME || '')
  .model<ApartmentDocument>('apartment', apartmentSchema);
