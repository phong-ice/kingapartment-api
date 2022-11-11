import mongoose, { Schema, Document } from 'mongoose';
import Account from './account.interface';
import 'dotenv/config';

const AccountSchema = new Schema({
  avatar: { type: String, require: false },
  fullname: { type: String, require: true },
  email: { type: String, require: true, unique: true },
  countApartment: { type: String, require: false, default: '0' },
});

interface AccountDocumnet extends Account, Document {}

export default mongoose.connection
  .useDb(process.env.DATABASE_NAME || '')
  .model<AccountDocumnet>('account', AccountSchema);
