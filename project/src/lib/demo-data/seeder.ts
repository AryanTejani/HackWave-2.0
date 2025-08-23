import { connectToDatabase } from '@/lib/mongo';
import Product from '@/models/Product';
import Shipment from '@/models/Shipment';
import { demoProducts } from './products';
import { demoShipments } from './shipments';

export async function seedDemoData() {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await Product.deleteMany({});
    await Shipment.deleteMany({});
    
    // Seed products
    const seededProducts = await Product.insertMany(demoProducts);
    console.log(`✅ Seeded ${seededProducts.length} products`);
    
    // Seed shipments with proper product references
    const shipmentData = demoShipments.map(shipment => {
      const product = seededProducts.find(p => p.name === shipment.productId.name);
      return {
        ...shipment,
        productId: product?._id || seededProducts[0]._id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    const seededShipments = await Shipment.insertMany(shipmentData);
    console.log(`✅ Seeded ${seededShipments.length} shipments`);
    
    return {
      products: seededProducts.length,
      shipments: seededShipments.length
    };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

export async function checkDemoData() {
  try {
    await connectToDatabase();
    
    const productCount = await Product.countDocuments();
    const shipmentCount = await Shipment.countDocuments();
    
    return {
      products: productCount,
      shipments: shipmentCount,
      hasData: productCount > 0 && shipmentCount > 0
    };
  } catch (error) {
    console.error('Error checking demo data:', error);
    return {
      products: 0,
      shipments: 0,
      hasData: false
    };
  }
}
