import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the document
export interface IWarehouse extends Document {
  Warehouse_ID: string;
  Warehouse_Name: string;
  Location: string;
  Capacity: number;
  Current_Stock: number;
  Storage_Cost: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const WarehouseSchema = new Schema<IWarehouse>(
  {
    Warehouse_ID: {
      type: String,
      required: [true, 'Warehouse ID is required'],
      trim: true,
      maxlength: [50, 'Warehouse ID cannot exceed 50 characters']
    },
    Warehouse_Name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
      maxlength: [100, 'Warehouse name cannot exceed 100 characters']
    },
    Location: {
      type: String,
      required: [true, 'Warehouse location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    Capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity cannot be negative']
    },
    Current_Stock: {
      type: Number,
      required: [true, 'Current stock is required'],
      min: [0, 'Current stock cannot be negative'],
      default: 0
    },
    Storage_Cost: {
      type: Number,
      required: [true, 'Storage cost is required'],
      min: [0, 'Storage cost cannot be negative']
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

// Add compound index for userId + Warehouse_ID to ensure uniqueness per user
WarehouseSchema.index({ userId: 1, Warehouse_ID: 1 }, { unique: true });

// Virtual for calculating utilization percentage
WarehouseSchema.virtual('utilizationPercentage').get(function() {
  if (this.Capacity === 0) return 0;
  return (this.Current_Stock / this.Capacity) * 100;
});

// Virtual for calculating available capacity
WarehouseSchema.virtual('availableCapacity').get(function() {
  return Math.max(0, this.Capacity - this.Current_Stock);
});

// Virtual for calculating monthly storage cost
WarehouseSchema.virtual('monthlyStorageCost').get(function() {
  return this.Current_Stock * this.Storage_Cost;
});

// Indexes for better query performance
WarehouseSchema.index({ Location: 1 });
WarehouseSchema.index({ Current_Stock: -1 });
WarehouseSchema.index({ Storage_Cost: -1 });
WarehouseSchema.index({ createdAt: -1 });
WarehouseSchema.index({ Warehouse_Name: 'text', Location: 'text' }); // Text search index

// Export the model
export const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', WarehouseSchema);
