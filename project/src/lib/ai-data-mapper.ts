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

    // Save new data (append to existing data)
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
        "origin": "string (optional, max 100 chars) - map from Origin, Country of Origin, Source, Made In, Origin Country, or similar",
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
        "rating": "number (optional, 0-5) - map from Rating, Score, Supplier Rating, or default to 4.0",
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
        "productId": "string (required) - map from Product ID, Product, or generate a reference ID",
        "origin": "string (required) - map from Origin, From, Source, or similar",
        "destination": "string (required) - map from Destination, To, Delivery Address, or similar",
        "status": "string (enum: 'On-Time', 'Delayed', 'Stuck', 'Delivered') - map from Status, Shipment Status, or default to 'On-Time'",
        "expectedDelivery": "Date object (required) - map from Expected Delivery, ETA, Delivery Date, or generate future date",
        "actualDelivery": "Date object (optional) - map from Actual Delivery, Delivered Date, or null",
        "trackingNumber": "string (optional) - map from Tracking Number, Tracking ID, or generate unique tracking",
        "quantity": "number (required, min 1) - map from Quantity, Qty, Amount, or default to 1",
        "totalValue": "number (required, min 0) - map from Total Value, Value, Amount, Price, or default to 1000",
        "shippingMethod": "string (enum: 'Air', 'Sea', 'Land', 'Express') - map from Shipping Method, Method, Transport, or default to 'Land'",
        "carrier": "string (required) - map from Carrier, Shipping Company, Transport Company, or default to 'Standard Carrier'",
        "currentLocation": "string (optional) - map from Current Location, Location, or null",
        "estimatedArrival": "Date object (optional) - map from Estimated Arrival, ETA, or null",
        "riskFactors": "array of strings (optional) - map from Risk Factors, Risks, or empty array"
      }
    `
  };

  const schema = schemaDefinitions[dataType as keyof typeof schemaDefinitions];
  
  return `You are an expert data mapping AI for a supply chain management platform. Your task is to analyze raw JSON data from a user's uploaded file and map it to our strict database schema.

**Instructions:**
1. **Analyze the User's Data:** Understand the structure and headers of the user's JSON array.
2. **Map to the Target Schema:** For each object in the user's array, create a new object that perfectly matches the provided Mongoose schema.
3. **Be Intelligent with Mapping:** User column names will vary. Use your knowledge to map intelligently. For example:
   * For the **Product** schema's \`origin\` field, look for user columns named "Country of Origin", "Source", "Made In", "Origin Country", "Origin", or "Country".
   * For the **Supplier** schema's \`rating\` field, look for "Rating", "Score", "Supplier Rating", or "Quality Score". If the value is a string like "4.5 out of 5", extract the number 4.5.
   * For **Product** schema's \`name\` field, look for "Product Name", "Name", "Product", "Item Name", "Description", or "Title".
   * For **Supplier** schema's \`name\` field, look for "Supplier Name", "Name", "Company", "Vendor", "Manufacturer", or "Supplier".
4. **Handle Missing Data Gracefully:** If a non-essential field (like a product's \`origin\` or a supplier's \`rating\`) is missing from the user's data, omit the field entirely from the final JSON object. Do not invent data.
5. **Smart Defaults:** Only use defaults for truly optional fields. For required fields, try to extract from related data or use sensible business logic.
6. **Data Type Conversion:** Convert string numbers to actual numbers, handle date strings properly, and ensure arrays are properly formatted.
7. **Output:** Return ONLY a valid JSON array of the mapped objects. Do not include any explanations, comments, or surrounding text.

**Target Schema for '${dataType}':**
${schema}

**Raw data to map:**
${JSON.stringify(sampleData, null, 2)}

**CRITICAL:** Process ALL records in the dataset, not just the sample shown above. The sample is for understanding the field structure.`;
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
        // origin is now optional, but if present, validate it's a string
        if (record.origin !== undefined && typeof record.origin !== 'string') {
          errors.push(`Record ${index}: Invalid origin - must be a string if provided`);
        }
        break;
      case 'suppliers':
        if (!record.name || typeof record.name !== 'string') {
          errors.push(`Record ${index}: Invalid or missing name`);
        }
        if (!record.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
          errors.push(`Record ${index}: Invalid email format`);
        }
        // rating is now optional, but if present, validate it's a number between 0-5
        if (record.rating !== undefined && (typeof record.rating !== 'number' || record.rating < 0 || record.rating > 5)) {
          errors.push(`Record ${index}: Invalid rating - must be a number between 0-5 if provided`);
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
        if (!record.productId || typeof record.productId !== 'string') {
          errors.push(`Record ${index}: Invalid or missing productId`);
        }
        if (!record.origin || typeof record.origin !== 'string') {
          errors.push(`Record ${index}: Invalid or missing origin`);
        }
        if (!record.destination || typeof record.destination !== 'string') {
          errors.push(`Record ${index}: Invalid or missing destination`);
        }
        if (!record.status || !['On-Time', 'Delayed', 'Stuck', 'Delivered'].includes(record.status)) {
          errors.push(`Record ${index}: Invalid status - must be On-Time, Delayed, Stuck, or Delivered`);
        }
        if (!record.expectedDelivery || !(record.expectedDelivery instanceof Date)) {
          errors.push(`Record ${index}: Invalid or missing expectedDelivery - must be a Date object`);
        }
        if (typeof record.quantity !== 'number' || record.quantity < 1) {
          errors.push(`Record ${index}: Invalid quantity - expected number >= 1, got ${typeof record.quantity}: ${record.quantity}`);
        }
        if (!record.shippingMethod || !['Air', 'Sea', 'Land', 'Express'].includes(record.shippingMethod)) {
          errors.push(`Record ${index}: Invalid shippingMethod - must be Air, Sea, Land, or Express`);
        }
        if (!record.carrier || typeof record.carrier !== 'string') {
          errors.push(`Record ${index}: Invalid or missing carrier`);
        }
        if (typeof record.totalValue !== 'number' || record.totalValue < 0) {
          errors.push(`Record ${index}: Invalid totalValue - expected number >= 0, got ${typeof record.totalValue}: ${record.totalValue}`);
        }
        // Validate optional date fields
        if (record.actualDelivery && !(record.actualDelivery instanceof Date)) {
          errors.push(`Record ${index}: Invalid actualDelivery - must be a Date object or null`);
        }
        if (record.estimatedArrival && !(record.estimatedArrival instanceof Date)) {
          errors.push(`Record ${index}: Invalid estimatedArrival - must be a Date object or null`);
        }
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
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
        // origin is now optional - only set if found in the data
        const originValue = record['Origin'] || record['Country of Origin'] || record['Source'] || record['Made In'] || record['Origin Country'] || record['Country'];
        if (originValue && originValue !== 'Unknown') {
          transformed.origin = originValue;
        }
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
        // rating is now optional - only set if found in the data
        const ratingValue = record['Rating'] || record['Score'] || record['Supplier Rating'] || record['Quality Score'];
        if (ratingValue) {
          // Handle string ratings like "4.5 out of 5"
          if (typeof ratingValue === 'string') {
            const numericRating = parseFloat(ratingValue.replace(/[^\d.]/g, ''));
            if (!isNaN(numericRating) && numericRating >= 0 && numericRating <= 5) {
              transformed.rating = numericRating;
            }
          } else if (typeof ratingValue === 'number' && ratingValue >= 0 && ratingValue <= 5) {
            transformed.rating = ratingValue;
          }
        }
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
        transformed.productId = record['Product ID'] || record['Product'] || `PRODUCT_${index + 1}`;
        transformed.origin = record['Origin'] || record['From'] || record['Source'] || 'Unknown';
        transformed.destination = record['Destination'] || record['To'] || record['Delivery Address'] || 'Unknown';
        transformed.status = record['Status'] || record['Shipment Status'] || 'On-Time';
        
        // Handle expectedDelivery date
        const expectedDeliveryStr = record['Expected Delivery'] || record['ETA'] || record['Delivery Date'];
        if (expectedDeliveryStr) {
          transformed.expectedDelivery = new Date(expectedDeliveryStr);
        } else {
          transformed.expectedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        }
        
        // Handle actualDelivery date
        const actualDeliveryStr = record['Actual Delivery'] || record['Delivered Date'];
        if (actualDeliveryStr) {
          transformed.actualDelivery = new Date(actualDeliveryStr);
        } else {
          transformed.actualDelivery = null;
        }
        
        transformed.trackingNumber = record['Tracking Number'] || record['Tracking ID'] || `TRK_${index + 1}`;
        transformed.quantity = parseFloat(record['Quantity'] || record['Qty'] || record['Amount'] || '1');
        transformed.totalValue = parseFloat(record['Total Value'] || record['Value'] || record['Amount'] || record['Price'] || '1000');
        transformed.shippingMethod = record['Shipping Method'] || record['Method'] || record['Transport'] || 'Land';
        transformed.carrier = record['Carrier'] || record['Shipping Company'] || record['Transport Company'] || 'Standard Carrier';
        transformed.currentLocation = record['Current Location'] || record['Location'] || null;
        
        // Handle estimatedArrival date
        const estimatedArrivalStr = record['Estimated Arrival'] || record['ETA'];
        if (estimatedArrivalStr) {
          transformed.estimatedArrival = new Date(estimatedArrivalStr);
        } else {
          transformed.estimatedArrival = null;
        }
        
        transformed.riskFactors = [];
        break;
    }
    
    return transformed;
  });
}