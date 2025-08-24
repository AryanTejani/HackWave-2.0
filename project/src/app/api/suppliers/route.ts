import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Supplier, ISupplier } from '@/models/Supplier';
import { requireAuth } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    await connectToDatabase();
    
    // Filter suppliers by user ID
    const suppliers = await Supplier.find({ userId })
      .select('name location country rating status riskLevel specialties leadTime minimumOrder maximumOrder')
      .lean();

    return NextResponse.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

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

    // Create new supplier with user ID
    const supplier = new Supplier({
      ...body,
      userId, // Add user ID to the supplier
      name: body.name.trim(),
      location: body.location.trim(),
      country: body.country.trim(),
      contactPerson: body.contactPerson.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
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

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a supplier
export async function DELETE(request: NextRequest) {
  try {
    console.log('Suppliers API: DELETE request received');
    
    // Get authenticated user
    const user = await requireAuth(request);
    console.log('Suppliers API: User authenticated for DELETE:', user.email);
    
    await connectToDatabase();
    
    // Get supplier ID from URL params
    const url = new URL(request.url);
    const supplierId = url.searchParams.get('id');
    
    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Suppliers API: Deleting supplier with ID:', supplierId);
    
    // Find and delete the supplier
    const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
    
    if (!deletedSupplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    console.log('Suppliers API: Supplier deleted successfully:', deletedSupplier._id);
    
    return NextResponse.json({
      success: true,
      message: 'Supplier deleted successfully',
      deletedSupplier: {
        id: deletedSupplier._id,
        name: deletedSupplier.name
      }
    });
    
  } catch (error) {
    console.error('Suppliers API: Error in DELETE request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
