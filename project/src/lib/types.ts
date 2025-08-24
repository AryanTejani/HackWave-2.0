export interface Alert {
    shipmentId: string;
    productName: string;
    status: 'Delayed' | 'Stuck';
    origin: string;
    destination: string;
    expectedDelivery: Date;
    riskLevel: 'Low' | 'Medium' | 'High';
    suggestions: string[];
  }
  
  export interface ShipmentWithProduct {
    _id: string;
    productId: {
      _id: string;
      name: string;
      category: string;
      supplier: string;
      origin?: string;
    };
    origin: string;
    destination: string;
    status: 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';
    expectedDelivery: Date;
    actualDelivery?: Date;
    trackingNumber?: string;
    quantity?: number;
    totalValue?: number;
    shippingMethod?: string;
    carrier?: string;
    currentLocation?: string;
    estimatedArrival?: Date;
    riskFactors?: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  export interface UploadLog {
    _id: string;
    fileName: string;
    dataType: string;
    rowCount: number;
    status: 'Success' | 'Failed';
    userId: string;
    createdAt: string;
  }