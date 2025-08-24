import mongoose, { Document, Schema } from 'mongoose';

export interface IUploadLog extends Document {
  fileName: string;
  dataType: string;
  rowCount: number;
  status: 'Success' | 'Failed';
  userId: string;
  createdAt: Date;
}

const UploadLogSchema: Schema = new Schema({
  fileName: { type: String, required: true },
  dataType: { type: String, required: true },
  rowCount: { type: Number, required: true },
  status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid recompiling the model if it already exists
export default mongoose.models.UploadLog || mongoose.model<IUploadLog>('UploadLog', UploadLogSchema);