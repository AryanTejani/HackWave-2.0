import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the document
export interface ISupplyChain extends Document {
  productName: string;
  supplier: {
    name: string;
    country: string;
    region: string;
  };
  shipment: {
    origin: string;
    destination: string;
    status: 'In Transit' | 'Delivered' | 'Delayed';
  };
  riskFactors: {
    politicalRisk: number;
    supplierReliability: number;
    transportRisk: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const SupplyChainSchema = new Schema<ISupplyChain>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    supplier: {
      name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true,
        maxlength: [100, 'Supplier name cannot exceed 100 characters']
      },
      country: {
        type: String,
        required: [true, 'Supplier country is required'],
        trim: true,
        maxlength: [50, 'Country name cannot exceed 50 characters']
      },
      region: {
        type: String,
        required: [true, 'Supplier region is required'],
        trim: true,
        maxlength: [50, 'Region name cannot exceed 50 characters']
      }
    },
    shipment: {
      origin: {
        type: String,
        required: [true, 'Shipment origin is required'],
        trim: true,
        maxlength: [100, 'Origin cannot exceed 100 characters']
      },
      destination: {
        type: String,
        required: [true, 'Shipment destination is required'],
        trim: true,
        maxlength: [100, 'Destination cannot exceed 100 characters']
      },
      status: {
        type: String,
        required: [true, 'Shipment status is required'],
        enum: {
          values: ['In Transit', 'Delivered', 'Delayed'],
          message: 'Status must be either In Transit, Delivered, or Delayed'
        },
        default: 'In Transit'
      }
    },
    riskFactors: {
      politicalRisk: {
        type: Number,
        required: [true, 'Political risk score is required'],
        min: [0, 'Political risk cannot be less than 0'],
        max: [100, 'Political risk cannot exceed 100']
      },
      supplierReliability: {
        type: Number,
        required: [true, 'Supplier reliability score is required'],
        min: [0, 'Supplier reliability cannot be less than 0'],
        max: [100, 'Supplier reliability cannot exceed 100']
      },
      transportRisk: {
        type: Number,
        required: [true, 'Transport risk score is required'],
        min: [0, 'Transport risk cannot be less than 0'],
        max: [100, 'Transport risk cannot exceed 100']
      }
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating overall risk score
SupplyChainSchema.virtual('overallRiskScore').get(function() {
  const { politicalRisk, supplierReliability, transportRisk } = this.riskFactors;
  // Calculate weighted average (you can adjust weights as needed)
  const weightedScore = (politicalRisk * 0.3) + ((100 - supplierReliability) * 0.4) + (transportRisk * 0.3);
  return Math.round(weightedScore);
});

// Virtual for risk level based on overall score
SupplyChainSchema.virtual('riskLevel').get(function() {
  const score = this.overallRiskScore;
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
});

// Index for better query performance
SupplyChainSchema.index({ 'supplier.country': 1, 'shipment.status': 1 });
SupplyChainSchema.index({ createdAt: -1 });

// Export the model
export const SupplyChain = mongoose.models.SupplyChain || mongoose.model<ISupplyChain>('SupplyChain', SupplyChainSchema);
