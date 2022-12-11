import mongoose, { Schema, Document } from 'mongoose';
import Notification from './notification.interface';
import 'dotenv/config';

const NotificationSchema = new Schema(
  {
    title: { type: String, require: true },
    message: { type: String, require: true },
    isSeen: { type: String, require: false, default: false },
    time: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

interface NotificationDocumnet extends Notification, Document {}

export default mongoose.connection
  .useDb(process.env.DATABASE_NAME || '')
  .model<NotificationDocumnet>('notification', NotificationSchema);
