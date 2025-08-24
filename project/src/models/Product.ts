// lib/models/Product.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the document
export interface IProduct extends Document {
  name: string;
  category: string;
  supplier: string;
  origin: string;
  description: string;
  unitCost: number;
  leadTime: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  riskLevel: 'low' | 'medium' | 'high';
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters']
    },
    supplier: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    origin: {
      type: String,
      required: [true, 'Product origin is required'],
      trim: true,
      maxlength: [100, 'Origin cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required'],
      min: [0, 'Unit cost cannot be negative']
    },
    leadTime: {
      type: Number,
      required: [true, 'Lead time is required'],
      min: [1, 'Lead time must be at least 1 day']
    },
    minOrderQuantity: {
      type: Number,
      required: [true, 'Minimum order quantity is required'],
      min: [1, 'Minimum order quantity must be at least 1']
    },
    maxOrderQuantity: {
      type: Number,
      required: [true, 'Maximum order quantity is required'],
      min: [1, 'Maximum order quantity must be at least 1']
    },
    riskLevel: {
      type: String,
      required: [true, 'Risk level is required'],
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Risk level must be either low, medium, or high'
      },
      default: 'medium'
    },
    certifications: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.every(cert => cert.length <= 20);
        },
        message: 'Each certification cannot exceed 20 characters'
      }
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating total inventory value (if needed later)
ProductSchema.virtual('totalValue').get(function() {
  return this.unitCost * (this.minOrderQuantity || 0);
});

// Index for better query performance
ProductSchema.index({ category: 1, riskLevel: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Text search index

// Export the model
export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);