import { connectToDatabase } from '@/lib/mongo';
import { Product } from '@/models/Product';
import { Shipment } from '@/models/Shipment';
import { Supplier } from '@/models/Supplier';
import { SupplyChain } from '@/models/SupplyChain';
import { demoProducts } from './products';
import { demoShipments } from './shipments';
import { demoSuppliers } from './suppliers';
import { demoSupplyChains } from './supply-chains';

export async function seedDemoData(userId: string) {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    console.log('Clearing existing data for user:', userId);
    // Clear existing data for this user
    await Product.deleteMany({ userId });
    await Shipment.deleteMany({ userId });
    await Supplier.deleteMany({ userId });
    await SupplyChain.deleteMany({ userId });
    console.log('Existing data cleared');
    
    console.log('Seeding products...');
    // Seed products with user ID - remove hardcoded _id to let MongoDB generate them
    const productsWithUserId = demoProducts.map(product => {
      const { _id, ...productWithoutId } = product;
      return {
        ...productWithoutId,
        userId
      };
    });
    console.log('Products to seed:', productsWithUserId.length);
    const seededProducts = await Product.insertMany(productsWithUserId);
    console.log(`✅ Seeded ${seededProducts.length} products for user ${userId}`);
    
    console.log('Seeding suppliers...');
    // Seed suppliers with user ID
    const suppliersWithUserId = demoSuppliers.map(supplier => ({
      ...supplier,
      userId
    }));
    console.log('Suppliers to seed:', suppliersWithUserId.length);
    const seededSuppliers = await Supplier.insertMany(suppliersWithUserId);
    console.log(`✅ Seeded ${seededSuppliers.length} suppliers for user ${userId}`);
    
    console.log('Seeding shipments...');
    // Seed shipments with proper product references and user ID - remove hardcoded _id
    const shipmentData = demoShipments.map(shipment => {
      const product = seededProducts.find(p => p.name === shipment.productId.name);
      const { _id, productId: originalProductId, ...shipmentWithoutId } = shipment;
      return {
        ...shipmentWithoutId,
        productId: product?._id || seededProducts[0]._id,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    console.log('Shipments to seed:', shipmentData.length);
    const seededShipments = await Shipment.insertMany(shipmentData);
    console.log(`✅ Seeded ${seededShipments.length} shipments for user ${userId}`);
    
    console.log('Seeding supply chains...');
    // Seed supply chains with user ID
    const supplyChainsWithUserId = demoSupplyChains.map(supplyChain => ({
      ...supplyChain,
      userId
    }));
    console.log('Supply chains to seed:', supplyChainsWithUserId.length);
    const seededSupplyChains = await SupplyChain.insertMany(supplyChainsWithUserId);
    console.log(`✅ Seeded ${seededSupplyChains.length} supply chains for user ${userId}`);
    
    const result = {
      products: seededProducts.length,
      suppliers: seededSuppliers.length,
      shipments: seededShipments.length,
      supplyChains: seededSupplyChains.length
    };
    
    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      userId
    });
    throw error;
  }
}

export async function checkDemoData(userId: string) {
  try {
    await connectToDatabase();
    
    const productCount = await Product.countDocuments({ userId });
    const shipmentCount = await Shipment.countDocuments({ userId });
    const supplierCount = await Supplier.countDocuments({ userId });
    const supplyChainCount = await SupplyChain.countDocuments({ userId });
    
    return {
      products: productCount,
      suppliers: supplierCount,
      shipments: shipmentCount,
      supplyChains: supplyChainCount,
      hasData: productCount > 0 && shipmentCount > 0
    };
  } catch (error) {
    console.error('Error checking demo data:', error);
    return {
      products: 0,
      suppliers: 0,
      shipments: 0,
      supplyChains: 0,
      hasData: false
    };
  }
}
