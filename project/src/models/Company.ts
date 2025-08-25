import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: String,
    tagline: String,
    industry: String,
    founded: String,
    headquarters: {
      city: String,
      country: String,
      address: String,
    },
    description: String,
    mission: String,
    vision: String,
    values: [String],
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'startup'
    },
    website: String,
    email: String,
    phone: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
    certifications: [String],
    awards: [String],
    teamSize: Number,
    annualRevenue: String,
    keyProducts: [String],
    targetMarkets: [String],
    partnerships: [String],
    sustainability: {
      isCertified: { type: Boolean, default: false },
      initiatives: [String],
      goals: [String],
    },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
