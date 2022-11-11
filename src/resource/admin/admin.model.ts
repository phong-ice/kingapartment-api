import mongoose, { Schema } from 'mongoose';
import AdminAccount from './admin.interface';
import 'dotenv/config';

const AdminSchema = new Schema({
  username: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  fullname: { type: String, require: true },
});

interface AdminDocument extends AdminAccount, Document {}

export default mongoose.connection
  .useDb(process.env.DATABASE_NAME || '')
  .model<AdminDocument>('admin', AdminSchema);
