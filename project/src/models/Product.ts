// lib/models/Product.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  category: string;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;