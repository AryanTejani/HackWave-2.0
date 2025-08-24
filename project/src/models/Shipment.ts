// lib/models/Shipment.ts
import mongoose, { Document, Schema } from 'mongoose';
import { IProduct } from './Product';

export type ShipmentStatus = 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';
export type ShippingMethod = 'Air' | 'Sea' | 'Land' | 'Express';

export interface IShipment extends Document {
  productId: mongoose.Types.ObjectId | IProduct;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  expectedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  quantity: number;
  totalValue: number;
  shippingMethod: ShippingMethod;
  carrier: string;
  currentLocation?: string;
  estimatedArrival?: Date;
  riskFactors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true,
    maxlength: [100, 'Origin cannot exceed 100 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    maxlength: [100, 'Destination cannot exceed 100 characters']
  },
  status: {
    type: String,
    required: [true, 'Shipment status is required'],
    enum: {
      values: ['On-Time', 'Delayed', 'Stuck', 'Delivered'],
      message: 'Status must be either On-Time, Delayed, Stuck, or Delivered'
    },
    default: 'On-Time'
  },
  expectedDelivery: {
    type: Date,
    required: [true, 'Expected delivery date is required'],
  },
  actualDelivery: {
    type: Date,
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Tracking number cannot exceed 50 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  totalValue: {
    type: Number,
    required: [true, 'Total value is required'],
    min: [0, 'Total value cannot be negative']
  },
  shippingMethod: {
    type: String,
    required: [true, 'Shipping method is required'],
    enum: {
      values: ['Air', 'Sea', 'Land', 'Express'],
      message: 'Shipping method must be either Air, Sea, Land, or Express'
    }
  },
  carrier: {
    type: String,
    required: [true, 'Carrier is required'],
    trim: true,
    maxlength: [100, 'Carrier name cannot exceed 100 characters']
  },
  currentLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Current location cannot exceed 200 characters']
  },
  estimatedArrival: {
    type: Date,
  },
  riskFactors: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.every(factor => factor.length <= 50);
      },
      message: 'Each risk factor cannot exceed 50 characters'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating days until delivery
ShipmentSchema.virtual('daysUntilDelivery').get(function() {
  if (this.actualDelivery) return 0;
  const today = new Date();
  const deliveryDate = this.expectedDelivery;
  const diffTime = deliveryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for calculating delay days
ShipmentSchema.virtual('delayDays').get(function() {
  if (this.status !== 'Delayed' && this.status !== 'Stuck') return 0;
  const today = new Date();
  const deliveryDate = this.expectedDelivery;
  const diffTime = today.getTime() - deliveryDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Index for better query performance
ShipmentSchema.index({ status: 1, expectedDelivery: 1 });
ShipmentSchema.index({ productId: 1 });
ShipmentSchema.index({ carrier: 1 });
ShipmentSchema.index({ createdAt: -1 });
ShipmentSchema.index({ 'riskFactors': 1 });

// Export the model
export const Shipment = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);

