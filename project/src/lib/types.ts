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
    };
    origin: string;
    destination: string;
    status: 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';
    expectedDelivery: Date;
    actualDelivery?: Date;
    trackingNumber?: string;
    createdAt: Date;
    updatedAt: Date;
  }