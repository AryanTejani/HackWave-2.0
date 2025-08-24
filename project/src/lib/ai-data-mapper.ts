import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { Factory } from '@/models/Factory';
import { Warehouse } from '@/models/Warehouse';
import { Retailer } from '@/models/Retailer';
import { Shipment } from '@/models/Shipment';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

interface MappingResult {
  success: boolean;
  data: any[];
  errors?: string[];
}

export async function mapAndSaveDataWithAI(
  userId: string, 
  dataType: string, 
  jsonData: any[]
): Promise<MappingResult> {
  try {
    console.log(`Starting AI mapping for ${dataType} with ${jsonData.length} records`);
    console.log(`Raw data sample:`, JSON.stringify(jsonData.slice(0, 2), null, 2));

    // Generate data-specific prompt for Gemini
    const prompt = generateMappingPrompt(dataType, jsonData);
    
    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let mappedData: any[];
    try {
      // Extract JSON from the response (handle potential markdown formatting)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                       text.match(/```\s*([\s\S]*?)\s*```/) || 
                       [null, text];
      
      const jsonString = jsonMatch[1] || text;
      mappedData = JSON.parse(jsonString);
      
      if (!Array.isArray(mappedData)) {
        throw new Error('AI response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', text);
      console.log('Attempting fallback data transformation...');
      
      // Fallback: Try to transform the raw data directly
      mappedData = transformRawDataToSchema(dataType, jsonData);
    }

    // Validate mapped data
    const validationResult = validateMappedData(dataType, mappedData);
    if (!validationResult.isValid) {
      throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Add userId to all records
    const dataWithUserId = mappedData.map(record => ({
      ...record,
      userId: userId
    }));

    // Delete existing data for this user and type
    await deleteExistingData(userId, dataType);

    // Save new data
    const savedData = await saveData(dataType, dataWithUserId);

    console.log(`Successfully mapped and saved ${savedData.length} ${dataType} records`);

    return {
      success: true,
      data: savedData
    };

  } catch (error) {
    console.error(`Error in mapAndSaveDataWithAI for ${dataType}:`, error);
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

function generateMappingPrompt(dataType: string, jsonData: any[]): string {
  const sampleData = jsonData.slice(0, 3); // Use first 3 records as sample
  
  const schemaDefinitions = {
    products: `
      {
        "name": "string (required, max 100 chars) - map from Product Name, Product, Name, or similar",
        "category": "string (required, max 50 chars) - map from Category, Type, Product Category, or similar",
        "supplier": "string (required, max 100 chars) - map from Supplier, Vendor, Manufacturer, or similar",
        "origin": "string (required, max 100 chars) - map from Origin, Country, Source, or similar",
        "description": "string (required, max 500 chars) - map from Description, Details, or create from name if missing",
        "unitCost": "number (required, min 0) - map from Unit Cost, Price, Cost, Unit Price, or similar",
        "leadTime": "number (required, min 1) - map from Lead Time, Delivery Time, or default to 30",
        "minOrderQuantity": "number (required, min 1) - map from Min Order, Minimum Order, or default to 1",
        "maxOrderQuantity": "number (required, min 1) - map from Max Order, Maximum Order, or default to 1000",
        "riskLevel": "string (required, enum: 'low', 'medium', 'high') - map from Risk Level, Risk, or default to 'medium'",
        "certifications": "array of strings (optional) - map from Certifications, Cert, or empty array"
      }
    `,
    suppliers: `
      {
        "name": "string (required, max 100 chars) - map from Supplier Name, Name, Company, or similar",
        "location": "string (required) - map from Location, Address, City, or similar",
        "country": "string (required) - map from Country, Nation, or extract from location",
        "contactPerson": "string (required) - map from Contact, Contact Person, Representative, or default to 'Primary Contact'",
        "email": "string (required, valid email) - map from Email, Contact Email, or generate if missing",
        "phone": "string (required) - map from Phone, Contact Phone, or default to 'N/A'",
        "rating": "number (required, 0-5) - map from Rating, Score, or default to 4.0",
        "status": "string (enum: 'active', 'inactive', 'pending') - map from Status or default to 'active'",
        "riskLevel": "string (enum: 'low', 'medium', 'high') - map from Risk Level, Risk, or default to 'medium'",
        "certifications": "array of strings (optional) - map from Certifications, Cert, or empty array",
        "leadTime": "number (required, min 1) - map from Lead Time, Delivery Time, or default to 30",
        "paymentTerms": "string (required) - map from Payment Terms, Terms, or default to 'Net 30'",
        "minimumOrder": "number (required, min 0) - map from Min Order, Minimum Order, or default to 0",
        "maximumOrder": "number (required, min 1) - map from Max Order, Maximum Order, or default to 10000",
        "specialties": "array of strings (optional) - map from Specialties, Products, or empty array"
      }
    `,
    factories: `
      {
        "Factory_ID": "string (required, max 50 chars) - map from Factory ID, ID, Factory Code, or generate unique ID",
        "Factory_Name": "string (required, max 100 chars) - map from Factory Name, Name, Plant Name, or similar",
        "Location": "string (required, max 200 chars) - map from Location, Address, City, or similar",
        "Capacity": "number (required, min 0) - map from Capacity, Production Capacity, or default to 1000",
        "Utilization": "number (required, 0-100) - map from Utilization, Usage, or default to 75",
        "Lead_Time": "number (required, min 1) - map from Lead Time, Production Time, or default to 14",
        "Quality_Rating": "number (required, 0-5) - map from Quality Rating, Rating, Score, or default to 4.0",
        "Certifications": "array of strings (optional) - map from Certifications, Cert, or empty array"
      }
    `,
    warehouses: `
      {
        "Warehouse_ID": "string (required, max 50 chars) - map from Warehouse ID, ID, Warehouse Code, or generate unique ID",
        "Warehouse_Name": "string (required, max 100 chars) - map from Warehouse Name, Name, Facility Name, or similar",
        "Location": "string (required, max 200 chars) - map from Location, Address, City, or similar",
        "Capacity": "number (required, min 0) - map from Capacity, Storage Capacity, or default to 10000",
        "Current_Stock": "number (required, min 0) - map from Current Stock, Stock, Inventory, or default to 0",
        "Storage_Cost": "number (required, min 0) - map from Storage Cost, Cost, Rate, or default to 5.0"
      }
    `,
    retailers: `
      {
        "Retailer_ID": "string (required, max 50 chars) - map from Retailer ID, ID, Retailer Code, or generate unique ID",
        "Retailer_Name": "string (required, max 100 chars) - map from Retailer Name, Name, Store Name, or similar",
        "Location": "string (required, max 200 chars) - map from Location, Address, City, or similar",
        "Market_Segment": "string (required, max 100 chars) - map from Market Segment, Segment, Category, or default to 'General'",
        "Sales_Volume": "number (required, min 0) - map from Sales Volume, Volume, Sales, Revenue, or default to 100000"
      }
    `,
    shipments: `
      {
        "shipmentId": "string (required) - map from Shipment ID, ID, Tracking Number, or generate unique ID",
        "origin": "string (required) - map from Origin, From, Source, or similar",
        "destination": "string (required) - map from Destination, To, Delivery Address, or similar",
        "status": "string (enum: 'pending', 'in-transit', 'delivered', 'delayed') - map from Status, Shipment Status, or default to 'pending'",
        "estimatedDelivery": "string (ISO date) - map from Estimated Delivery, ETA, or generate future date",
        "actualDelivery": "string (ISO date, optional) - map from Actual Delivery, Delivered Date, or null",
        "carrier": "string (required) - map from Carrier, Shipping Company, or default to 'Standard Carrier'",
        "trackingNumber": "string (required) - map from Tracking Number, Tracking ID, or generate unique tracking",
        "items": "array of objects with product details - map from Items, Products, or create from available data",
        "totalValue": "number (required, min 0) - map from Total Value, Value, Amount, or default to 1000",
        "shippingCost": "number (required, min 0) - map from Shipping Cost, Cost, Freight Cost, or default to 100"
      }
    `
  };

  const schema = schemaDefinitions[dataType as keyof typeof schemaDefinitions];
  
  return `You are an expert data mapper for supply chain management systems. Your task is to transform raw Excel data into clean, structured JSON that matches our database schema.

Raw data to map:
${JSON.stringify(sampleData, null, 2)}

Required schema for ${dataType}:
${schema}

CRITICAL INSTRUCTIONS:
1. Look at the raw data field names and map them intelligently to the required schema fields
2. Use the field mapping hints provided in the schema (e.g., "map from Product Name, Product, Name, or similar")
3. For missing required fields, use sensible defaults as specified in the schema
4. Convert string numbers to actual numbers (e.g., "100" becomes 100)
5. Ensure all required fields are present and have valid data types
6. For dates, convert to ISO format (YYYY-MM-DD)
7. For arrays, create empty arrays if no data is available
8. Generate unique IDs for ID fields if not present in the data

IMPORTANT: The raw data may have different column names than the expected schema. Use intelligent field mapping based on the hints provided.

Return ONLY a valid JSON array with the mapped data. Do not include any explanations or markdown formatting.

Example response format:
[
  {
    "field1": "value1",
    "field2": "value2"
  }
]`;
}

function validateMappedData(dataType: string, data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('No data provided');
    return { isValid: false, errors };
  }

  // Basic validation for each record
  data.forEach((record, index) => {
    if (typeof record !== 'object' || record === null) {
      errors.push(`Record ${index}: Must be an object`);
      return;
    }

    // Add type-specific validation here if needed
    switch (dataType) {
      case 'products':
        if (!record.name || typeof record.name !== 'string') {
          errors.push(`Record ${index}: Invalid or missing name`);
        }
        if (!record.unitCost || typeof record.unitCost !== 'number' || record.unitCost < 0) {
          errors.push(`Record ${index}: Invalid unitCost - expected number >= 0, got ${typeof record.unitCost}: ${record.unitCost}`);
        }
        break;
      case 'suppliers':
        if (!record.name || typeof record.name !== 'string') {
          errors.push(`Record ${index}: Invalid or missing name`);
        }
        if (!record.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
          errors.push(`Record ${index}: Invalid email format`);
        }
        break;
      case 'factories':
        if (!record.Factory_ID || typeof record.Factory_ID !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Factory_ID`);
        }
        if (!record.Factory_Name || typeof record.Factory_Name !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Factory_Name`);
        }
        if (!record.Location || typeof record.Location !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Location`);
        }
        if (typeof record.Capacity !== 'number' || record.Capacity < 0) {
          errors.push(`Record ${index}: Invalid Capacity - expected number >= 0, got ${typeof record.Capacity}: ${record.Capacity}`);
        }
        break;
      case 'warehouses':
        if (!record.Warehouse_ID || typeof record.Warehouse_ID !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Warehouse_ID`);
        }
        if (!record.Warehouse_Name || typeof record.Warehouse_Name !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Warehouse_Name`);
        }
        if (!record.Location || typeof record.Location !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Location`);
        }
        if (typeof record.Capacity !== 'number' || record.Capacity < 0) {
          errors.push(`Record ${index}: Invalid Capacity - expected number >= 0, got ${typeof record.Capacity}: ${record.Capacity}`);
        }
        break;
      case 'retailers':
        if (!record.Retailer_ID || typeof record.Retailer_ID !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Retailer_ID`);
        }
        if (!record.Retailer_Name || typeof record.Retailer_Name !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Retailer_Name`);
        }
        if (!record.Location || typeof record.Location !== 'string') {
          errors.push(`Record ${index}: Invalid or missing Location`);
        }
        if (typeof record.Sales_Volume !== 'number' || record.Sales_Volume < 0) {
          errors.push(`Record ${index}: Invalid Sales_Volume - expected number >= 0, got ${typeof record.Sales_Volume}: ${record.Sales_Volume}`);
        }
        break;
      case 'shipments':
        if (!record.shipmentId || typeof record.shipmentId !== 'string') {
          errors.push(`Record ${index}: Invalid or missing shipmentId`);
        }
        if (!record.origin || typeof record.origin !== 'string') {
          errors.push(`Record ${index}: Invalid or missing origin`);
        }
        if (!record.destination || typeof record.destination !== 'string') {
          errors.push(`Record ${index}: Invalid or missing destination`);
        }
        if (typeof record.totalValue !== 'number' || record.totalValue < 0) {
          errors.push(`Record ${index}: Invalid totalValue - expected number >= 0, got ${typeof record.totalValue}: ${record.totalValue}`);
        }
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function deleteExistingData(userId: string, dataType: string): Promise<void> {
  const models = {
    products: Product,
    suppliers: Supplier,
    factories: Factory,
    warehouses: Warehouse,
    retailers: Retailer,
    shipments: Shipment
  };

  const model = models[dataType as keyof typeof models];
  if (model) {
    await model.deleteMany({ userId });
    console.log(`Deleted existing ${dataType} data for user ${userId}`);
  }
}

async function saveData(dataType: string, data: any[]): Promise<any[]> {
  const models = {
    products: Product,
    suppliers: Supplier,
    factories: Factory,
    warehouses: Warehouse,
    retailers: Retailer,
    shipments: Shipment
  };

  const model = models[dataType as keyof typeof models];
  if (!model) {
    throw new Error(`Unknown data type: ${dataType}`);
  }

  const savedData = await model.insertMany(data);
  return savedData;
}

// Fallback function to transform raw data when AI fails
function transformRawDataToSchema(dataType: string, rawData: any[]): any[] {
  console.log(`Using fallback transformation for ${dataType}`);
  
  return rawData.map((record, index) => {
    const transformed: any = {};
    
    switch (dataType) {
      case 'products':
        transformed.name = record['Product Name'] || record['Name'] || record['Product'] || `Product ${index + 1}`;
        transformed.category = record['Category'] || record['Type'] || 'General';
        transformed.supplier = record['Supplier'] || record['Vendor'] || 'Default Supplier';
        transformed.origin = record['Origin'] || record['Country'] || 'Unknown';
        transformed.description = record['Description'] || `Description for ${transformed.name}`;
        transformed.unitCost = parseFloat(record['Unit Cost'] || record['Price'] || record['Cost'] || '100');
        transformed.leadTime = parseInt(record['Lead Time'] || '30');
        transformed.minOrderQuantity = parseInt(record['Min Order'] || '1');
        transformed.maxOrderQuantity = parseInt(record['Max Order'] || '1000');
        transformed.riskLevel = record['Risk Level'] || 'medium';
        transformed.certifications = [];
        break;
        
      case 'suppliers':
        transformed.name = record['Supplier Name'] || record['Name'] || record['Company'] || `Supplier ${index + 1}`;
        transformed.location = record['Location'] || record['Address'] || record['City'] || 'Unknown';
        transformed.country = record['Country'] || 'Unknown';
        transformed.contactPerson = record['Contact'] || record['Contact Person'] || 'Primary Contact';
        transformed.email = record['Email'] || record['Contact Email'] || `${transformed.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        transformed.phone = record['Phone'] || record['Contact Phone'] || 'N/A';
        transformed.rating = parseFloat(record['Rating'] || '4.0');
        transformed.status = record['Status'] || 'active';
        transformed.riskLevel = record['Risk Level'] || 'medium';
        transformed.certifications = [];
        transformed.leadTime = parseInt(record['Lead Time'] || '30');
        transformed.paymentTerms = record['Payment Terms'] || 'Net 30';
        transformed.minimumOrder = parseFloat(record['Min Order'] || '0');
        transformed.maximumOrder = parseFloat(record['Max Order'] || '10000');
        transformed.specialties = [];
        break;
        
      case 'factories':
        transformed.Factory_ID = record['Factory ID'] || record['ID'] || `FACTORY_${index + 1}`;
        transformed.Factory_Name = record['Factory Name'] || record['Name'] || record['Plant Name'] || `Factory ${index + 1}`;
        transformed.Location = record['Location'] || record['Address'] || record['City'] || 'Unknown';
        transformed.Capacity = parseFloat(record['Capacity'] || record['Production Capacity'] || '1000');
        transformed.Utilization = parseFloat(record['Utilization'] || record['Usage'] || '75');
        transformed.Lead_Time = parseInt(record['Lead Time'] || record['Production Time'] || '14');
        transformed.Quality_Rating = parseFloat(record['Quality Rating'] || record['Rating'] || '4.0');
        transformed.Certifications = [];
        break;
        
      case 'warehouses':
        transformed.Warehouse_ID = record['Warehouse ID'] || record['ID'] || `WAREHOUSE_${index + 1}`;
        transformed.Warehouse_Name = record['Warehouse Name'] || record['Name'] || record['Facility Name'] || `Warehouse ${index + 1}`;
        transformed.Location = record['Location'] || record['Address'] || record['City'] || 'Unknown';
        transformed.Capacity = parseFloat(record['Capacity'] || record['Storage Capacity'] || '10000');
        transformed.Current_Stock = parseFloat(record['Current Stock'] || record['Stock'] || record['Inventory'] || '0');
        transformed.Storage_Cost = parseFloat(record['Storage Cost'] || record['Cost'] || record['Rate'] || '5.0');
        break;
        
      case 'retailers':
        transformed.Retailer_ID = record['Retailer ID'] || record['ID'] || `RETAILER_${index + 1}`;
        transformed.Retailer_Name = record['Retailer Name'] || record['Name'] || record['Store Name'] || `Retailer ${index + 1}`;
        transformed.Location = record['Location'] || record['Address'] || record['City'] || 'Unknown';
        transformed.Market_Segment = record['Market Segment'] || record['Segment'] || record['Category'] || 'General';
        transformed.Sales_Volume = parseFloat(record['Sales Volume'] || record['Volume'] || record['Sales'] || record['Revenue'] || '100000');
        break;
        
      case 'shipments':
        transformed.shipmentId = record['Shipment ID'] || record['ID'] || record['Tracking Number'] || `SHIP_${index + 1}`;
        transformed.origin = record['Origin'] || record['From'] || record['Source'] || 'Unknown';
        transformed.destination = record['Destination'] || record['To'] || record['Delivery Address'] || 'Unknown';
        transformed.status = record['Status'] || record['Shipment Status'] || 'pending';
        transformed.estimatedDelivery = record['Estimated Delivery'] || record['ETA'] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        transformed.actualDelivery = record['Actual Delivery'] || record['Delivered Date'] || null;
        transformed.carrier = record['Carrier'] || record['Shipping Company'] || 'Standard Carrier';
        transformed.trackingNumber = record['Tracking Number'] || record['Tracking ID'] || `TRK_${index + 1}`;
        transformed.items = [];
        transformed.totalValue = parseFloat(record['Total Value'] || record['Value'] || record['Amount'] || '1000');
        transformed.shippingCost = parseFloat(record['Shipping Cost'] || record['Cost'] || record['Freight Cost'] || '100');
        break;
    }
    
    return transformed;
  });
}
