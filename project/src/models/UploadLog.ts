import mongoose from "mongoose";

const UploadLogSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    dataType: { type: String, required: true },
    rowCount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Success', 'Failed'], 
      default: 'Success' 
    },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const UploadLog = mongoose.models.UploadLog || mongoose.model("UploadLog", UploadLogSchema);
