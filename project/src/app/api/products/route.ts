// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { demoProducts } from '@/lib/demo-data/products';

export async function GET() {
  try {
    return NextResponse.json(demoProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, supplier, origin, description, unitCost, leadTime, minOrderQuantity, maxOrderQuantity, riskLevel, certifications } = body;

    if (!name || !category || !supplier || !origin) {
      return NextResponse.json(
        { error: 'Name, category, supplier, and origin are required' },
        { status: 400 }
      );
    }

    // In a real app, you would save to database
    // For demo, just return the product data
    const newProduct = {
      _id: `prod_${Date.now()}`,
      name,
      category,
      supplier,
      origin,
      description: description || '',
      unitCost: unitCost || 0,
      leadTime: leadTime || 0,
      minOrderQuantity: minOrderQuantity || 0,
      maxOrderQuantity: maxOrderQuantity || 0,
      riskLevel: riskLevel || 'medium',
      certifications: certifications || [],
      lastUpdated: new Date()
    };

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
