import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Supplier, ISupplier } from '@/models/Supplier';

export async function GET() {
  try {
    await connectToDatabase();
    
    const suppliers = await Supplier.find({})
      .select('name location country rating status riskLevel specialties leadTime minimumOrder maximumOrder')
      .lean();

    return NextResponse.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'country', 'contactPerson', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating && (body.rating < 0 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 0 and 5' },
        { status: 400 }
      );
    }

    // Validate lead time
    if (body.leadTime && body.leadTime < 1) {
      return NextResponse.json(
        { success: false, error: 'Lead time must be at least 1 day' },
        { status: 400 }
      );
    }

    // Validate order quantities
    if (body.minimumOrder && body.minimumOrder < 0) {
      return NextResponse.json(
        { success: false, error: 'Minimum order cannot be negative' },
        { status: 400 }
      );
    }

    if (body.maximumOrder && body.maximumOrder < 1) {
      return NextResponse.json(
        { success: false, error: 'Maximum order must be at least 1' },
        { status: 400 }
      );
    }

    if (body.minimumOrder && body.maximumOrder && body.minimumOrder > body.maximumOrder) {
      return NextResponse.json(
        { success: false, error: 'Minimum order cannot be greater than maximum order' },
        { status: 400 }
      );
    }

    // Create new supplier
    const supplier = new Supplier({
      name: body.name,
      location: body.location,
      country: body.country,
      contactPerson: body.contactPerson,
      email: body.email,
      phone: body.phone,
      rating: body.rating || 0,
      status: body.status || 'pending',
      riskLevel: body.riskLevel || 'medium',
      certifications: body.certifications || [],
      leadTime: body.leadTime || 30,
      paymentTerms: body.paymentTerms || 'Net 30',
      minimumOrder: body.minimumOrder || 0,
      maximumOrder: body.maximumOrder || 10000,
      specialties: body.specialties || []
    });

    await supplier.save();

    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating supplier:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
