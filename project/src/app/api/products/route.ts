// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Product, IProduct } from '@/models/Product';

// GET - Fetch all products
export async function GET() {
  try {
    await connectToDatabase();
    
    const products = await Product.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert to plain JavaScript objects for better performance
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
      },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'name',
      'category',
      'supplier',
      'origin',
      'description',
      'unitCost',
      'leadTime',
      'minOrderQuantity',
      'maxOrderQuantity',
      'riskLevel'
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate risk level
    const validRiskLevels = ['low', 'medium', 'high'];
    if (!validRiskLevels.includes(body.riskLevel)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid risk level. Must be one of: low, medium, high' 
        },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    const numericFields = ['unitCost', 'leadTime', 'minOrderQuantity', 'maxOrderQuantity'];
    for (const field of numericFields) {
      const value = body[field];
      if (typeof value !== 'number' || value < 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} must be a positive number` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate min/max order quantity
    if (body.minOrderQuantity >= body.maxOrderQuantity) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Minimum order quantity must be less than maximum order quantity' 
        },
        { status: 400 }
      );
    }
    
    // Create new product
    const newProduct = new Product({
      name: body.name.trim(),
      category: body.category.trim(),
      supplier: body.supplier.trim(),
      origin: body.origin.trim(),
      description: body.description.trim(),
      unitCost: body.unitCost,
      leadTime: body.leadTime,
      minOrderQuantity: body.minOrderQuantity,
      maxOrderQuantity: body.maxOrderQuantity,
      riskLevel: body.riskLevel,
      certifications: body.certifications || []
    });
    
    const savedProduct = await newProduct.save();
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A product with this name already exists' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
      },
      { status: 500 }
    );
  }
}
