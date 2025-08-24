import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import * as xlsx from 'xlsx';
import { mapAndSaveDataWithAI } from '@/lib/ai-data-mapper';
import { connectToDatabase } from '@/lib/mongo';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Parse form data with formidable
    const formData = await request.formData();
    const files: { [key: string]: File } = {};
    
    // Extract files from form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      }
    }

    if (Object.keys(files).length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const results: { [key: string]: any } = {};
    const errors: string[] = [];

    // Process each file
    for (const [dataType, file] of Object.entries(files)) {
      try {
        console.log(`Processing ${dataType} file: ${file.name}`);

        // Validate file type
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
          errors.push(`${dataType}: Invalid file type. Only Excel and CSV files are supported.`);
          continue;
        }

        // Convert file to buffer
        const buffer = await file.arrayBuffer();

        // Parse Excel/CSV file
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Use first sheet
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: ''
        });

        // Remove empty rows and convert to objects
        const cleanData = jsonData
          .filter((row: any) => row.some((cell: any) => cell !== ''))
          .slice(1) // Remove header row
          .map((row: any) => {
            const headers = jsonData[0] as string[];
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              if (header && row[index] !== undefined) {
                obj[header] = row[index];
              }
            });
            return obj;
          })
          .filter((obj: any) => Object.keys(obj).length > 0);

        if (cleanData.length === 0) {
          errors.push(`${dataType}: No valid data found in file`);
          continue;
        }

        console.log(`Extracted ${cleanData.length} records from ${dataType} file`);

        // Use AI to map and save data
        const mappingResult = await mapAndSaveDataWithAI(
          session.user.id || session.user.email,
          dataType,
          cleanData
        );

        if (mappingResult.success) {
          results[dataType] = {
            success: true,
            recordsProcessed: mappingResult.data?.length || 0,
            message: `Successfully processed ${mappingResult.data?.length || 0} records`
          };
        } else {
          errors.push(`${dataType}: ${mappingResult.errors?.join(', ') || 'Mapping failed'}`);
        }

      } catch (error) {
        console.error(`Error processing ${dataType} file:`, error);
        errors.push(`${dataType}: ${error instanceof Error ? error.message : 'Processing failed'}`);
      }
    }

    // Return results
    if (errors.length > 0 && Object.keys(results).length === 0) {
      // All files failed
      return NextResponse.json(
        { 
          error: 'All files failed to process',
          details: errors 
        },
        { status: 400 }
      );
    } else if (errors.length > 0) {
      // Some files succeeded, some failed
      return NextResponse.json({
        success: true,
        results,
        warnings: errors,
        message: `Processed ${Object.keys(results).length} files successfully with ${errors.length} warnings`
      });
    } else {
      // All files succeeded
      return NextResponse.json({
        success: true,
        results,
        message: `Successfully processed ${Object.keys(results).length} files`
      });
    }

  } catch (error) {
    console.error('Error in data upload API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
