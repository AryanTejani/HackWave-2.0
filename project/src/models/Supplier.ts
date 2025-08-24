import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  location: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  riskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
  leadTime: number;
  paymentTerms: string;
  minimumOrder: number;
  maximumOrder: number;
  specialties: string[];
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  certifications: [{
    type: String,
    trim: true
  }],
  leadTime: {
    type: Number,
    required: [true, 'Lead time is required'],
    min: [1, 'Lead time must be at least 1 day'],
    default: 30
  },
  paymentTerms: {
    type: String,
    required: [true, 'Payment terms are required'],
    trim: true,
    default: 'Net 30'
  },
  minimumOrder: {
    type: Number,
    required: [true, 'Minimum order quantity is required'],
    min: [0, 'Minimum order cannot be negative'],
    default: 0
  },
  maximumOrder: {
    type: Number,
    required: [true, 'Maximum order quantity is required'],
    min: [1, 'Maximum order must be at least 1'],
    default: 10000
  },
  specialties: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
supplierSchema.index({ name: 1 });
supplierSchema.index({ country: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ riskLevel: 1 });
supplierSchema.index({ rating: -1 });

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  return `${this.location}, ${this.country}`;
});

// Virtual for products count (will be populated from Product model)
supplierSchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier',
  count: true
});

// Ensure virtuals are serialized
supplierSchema.set('toJSON', { virtuals: true });
supplierSchema.set('toObject', { virtuals: true });

export const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', supplierSchema);
