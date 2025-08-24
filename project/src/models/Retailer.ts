import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the document
export interface IRetailer extends Document {
  Retailer_ID: string;
  Retailer_Name: string;
  Location: string;
  Market_Segment: string;
  Sales_Volume: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const RetailerSchema = new Schema<IRetailer>(
  {
    Retailer_ID: {
      type: String,
      required: [true, 'Retailer ID is required'],
      trim: true,
      maxlength: [50, 'Retailer ID cannot exceed 50 characters']
    },
    Retailer_Name: {
      type: String,
      required: [true, 'Retailer name is required'],
      trim: true,
      maxlength: [100, 'Retailer name cannot exceed 100 characters']
    },
    Location: {
      type: String,
      required: [true, 'Retailer location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    Market_Segment: {
      type: String,
      required: [true, 'Market segment is required'],
      trim: true,
      maxlength: [100, 'Market segment cannot exceed 100 characters']
    },
    Sales_Volume: {
      type: Number,
      required: [true, 'Sales volume is required'],
      min: [0, 'Sales volume cannot be negative']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add compound index for userId + Retailer_ID to ensure uniqueness per user
RetailerSchema.index({ userId: 1, Retailer_ID: 1 }, { unique: true });

// Virtual for calculating sales tier
RetailerSchema.virtual('salesTier').get(function() {
  if (this.Sales_Volume >= 1000000) return 'Premium';
  if (this.Sales_Volume >= 500000) return 'Gold';
  if (this.Sales_Volume >= 100000) return 'Silver';
  return 'Bronze';
});

// Virtual for calculating monthly average sales
RetailerSchema.virtual('monthlyAverageSales').get(function() {
  return this.Sales_Volume / 12;
});

// Indexes for better query performance
RetailerSchema.index({ Location: 1 });
RetailerSchema.index({ Market_Segment: 1 });
RetailerSchema.index({ Sales_Volume: -1 });
RetailerSchema.index({ createdAt: -1 });
RetailerSchema.index({ Retailer_Name: 'text', Location: 'text', Market_Segment: 'text' }); // Text search index

// Export the model
export const Retailer = mongoose.models.Retailer || mongoose.model('Retailer', RetailerSchema);
