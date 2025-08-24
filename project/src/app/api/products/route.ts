// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Product, IProduct } from '@/models/Product';
import { requireAuth } from '@/lib/auth-utils';

// GET - Fetch all products (temporarily showing all for demo)
export async function GET(request: NextRequest) {
  try {
    console.log('Products API: GET request received');
    
    // Connect to database
    await connectToDatabase();
    console.log('Products API: Database connected');
    
    // Get all products regardless of user (for demo purposes)
    const allProducts = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('Products API: Found', allProducts.length, 'total products');
    
    return NextResponse.json({
      success: true,
      data: allProducts,
      count: allProducts.length,
      message: 'Showing all products (demo mode)'
    });
    
  } catch (error) {
    console.error('Products API: Error in GET request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    console.log('Products API: POST request received');
    
    // Get authenticated user
    const user = await requireAuth(request);
    console.log('Products API: User authenticated:', user.email);
    
    await connectToDatabase();
    
    const body = await request.json();
    console.log('Products API: Request body:', body);
    
    // Create product with user ID
    const product = new Product({
      name: body.name || 'Test Product',
      category: body.category || 'Test Category',
      supplier: body.supplier || 'Test Supplier',
      origin: body.origin || 'Test Origin',
      description: body.description || 'Test Description',
      unitCost: Number(body.unitCost) || 100,
      leadTime: Number(body.leadTime) || 5,
      minOrderQuantity: Number(body.minOrderQuantity) || 10,
      maxOrderQuantity: Number(body.maxOrderQuantity) || 1000,
      riskLevel: body.riskLevel || 'medium',
      certifications: body.certifications || [],
      userId: user._id
    });
    
    console.log('Products API: Product object created:', {
      name: product.name,
      userId: product.userId
    });
    
    // Save the product
    await product.save();
    console.log('Products API: Product saved successfully with ID:', product._id);
    
    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
    
  } catch (error) {
    console.error('Products API: Error in POST request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    console.log('Products API: DELETE request received');
    
    // Get authenticated user
    const user = await requireAuth(request);
    console.log('Products API: User authenticated for DELETE:', user.email);
    
    await connectToDatabase();
    
    // Get product ID from URL params
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Products API: Deleting product with ID:', productId);
    
    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    console.log('Products API: Product deleted successfully:', deletedProduct._id);
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
      deletedProduct: {
        id: deletedProduct._id,
        name: deletedProduct.name
      }
    });
    
  } catch (error) {
    console.error('Products API: Error in DELETE request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
