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
    await connectToDatabase();
    
    // Clear existing data for this user
    await Product.deleteMany({ userId });
    await Shipment.deleteMany({ userId });
    await Supplier.deleteMany({ userId });
    await SupplyChain.deleteMany({ userId });
    
    // Seed products with user ID
    const productsWithUserId = demoProducts.map(product => ({
      ...product,
      userId
    }));
    const seededProducts = await Product.insertMany(productsWithUserId);
    console.log(`✅ Seeded ${seededProducts.length} products for user ${userId}`);
    
    // Seed suppliers with user ID
    const suppliersWithUserId = demoSuppliers.map(supplier => ({
      ...supplier,
      userId
    }));
    const seededSuppliers = await Supplier.insertMany(suppliersWithUserId);
    console.log(`✅ Seeded ${seededSuppliers.length} suppliers for user ${userId}`);
    
    // Seed shipments with proper product references and user ID
    const shipmentData = demoShipments.map(shipment => {
      const product = seededProducts.find(p => p.name === shipment.productId.name);
      return {
        ...shipment,
        productId: product?._id || seededProducts[0]._id,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    
    const seededShipments = await Shipment.insertMany(shipmentData);
    console.log(`✅ Seeded ${seededShipments.length} shipments for user ${userId}`);
    
    // Seed supply chains with user ID
    const supplyChainsWithUserId = demoSupplyChains.map(supplyChain => ({
      ...supplyChain,
      userId
    }));
    const seededSupplyChains = await SupplyChain.insertMany(supplyChainsWithUserId);
    console.log(`✅ Seeded ${seededSupplyChains.length} supply chains for user ${userId}`);
    
    return {
      products: seededProducts.length,
      suppliers: seededSuppliers.length,
      shipments: seededShipments.length,
      supplyChains: seededSupplyChains.length
    };
  } catch (error) {
    console.error('Error seeding demo data:', error);
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
