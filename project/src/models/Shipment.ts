// lib/models/Shipment.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProduct } from './Product';

export type ShipmentStatus = 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';

export interface IShipment extends Document {
  _id: string;
  productId: mongoose.Types.ObjectId | IProduct;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  expectedDelivery: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
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
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['On-Time', 'Delayed', 'Stuck', 'Delivered'],
    default: 'On-Time',
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
  },
}, {
  timestamps: true,
});

// Index for better query performance
ShipmentSchema.index({ status: 1, expectedDelivery: 1 });
ShipmentSchema.index({ productId: 1 });

const Shipment: Model<IShipment> = mongoose.models.Shipment || mongoose.model<IShipment>('Shipment', ShipmentSchema);

export default Shipment;

