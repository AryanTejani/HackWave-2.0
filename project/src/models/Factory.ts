import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the document
export interface IFactory extends Document {
  Factory_ID: string;
  Factory_Name: string;
  Location: string;
  Capacity: number;
  Utilization: number;
  Lead_Time: number;
  Quality_Rating: number;
  Certifications: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const FactorySchema = new Schema<IFactory>(
  {
    Factory_ID: {
      type: String,
      required: [true, 'Factory ID is required'],
      trim: true,
      maxlength: [50, 'Factory ID cannot exceed 50 characters']
    },
    Factory_Name: {
      type: String,
      required: [true, 'Factory name is required'],
      trim: true,
      maxlength: [100, 'Factory name cannot exceed 100 characters']
    },
    Location: {
      type: String,
      required: [true, 'Factory location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    Capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity cannot be negative']
    },
    Utilization: {
      type: Number,
      required: [true, 'Utilization is required'],
      min: [0, 'Utilization cannot be negative'],
      max: [100, 'Utilization cannot exceed 100%']
    },
    Lead_Time: {
      type: Number,
      required: [true, 'Lead time is required'],
      min: [1, 'Lead time must be at least 1 day']
    },
    Quality_Rating: {
      type: Number,
      required: [true, 'Quality rating is required'],
      min: [0, 'Quality rating cannot be negative'],
      max: [5, 'Quality rating cannot exceed 5']
    },
    Certifications: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.every(cert => cert.length <= 50);
        },
        message: 'Each certification cannot exceed 50 characters'
      }
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

// Add compound index for userId + Factory_ID to ensure uniqueness per user
FactorySchema.index({ userId: 1, Factory_ID: 1 }, { unique: true });

// Virtual for calculating efficiency score
FactorySchema.virtual('efficiencyScore').get(function() {
  return (this.Utilization / 100) * this.Quality_Rating;
});

// Indexes for better query performance
FactorySchema.index({ Location: 1 });
FactorySchema.index({ Quality_Rating: -1 });
FactorySchema.index({ Utilization: -1 });
FactorySchema.index({ createdAt: -1 });
FactorySchema.index({ Factory_Name: 'text', Location: 'text' }); // Text search index

// Export the model
export const Factory = mongoose.models.Factory || mongoose.model('Factory', FactorySchema);
