'use client';
import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Upload, 
  FileSpreadsheet, 
  Package, 
  Building, 
  Truck, 
  Warehouse, 
  Store,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DataHistory } from './data-history';
interface FileUpload {
  file: File;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'ai-mapping' | 'saving' | 'completed' | 'error';

export function DataOnboarding() {
  const { data: session } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const dataTypes = [
    { key: 'products', label: 'Products', icon: Package, description: 'Product catalog and specifications' },
    { key: 'suppliers', label: 'Suppliers', icon: Building, description: 'Supplier information and ratings' },
    { key: 'factories', label: 'Factories', icon: Building, description: 'Factory locations and capacities' },
    { key: 'shipments', label: 'Shipments', icon: Truck, description: 'Shipment tracking and logistics' },
    { key: 'warehouses', label: 'Warehouses', icon: Warehouse, description: 'Warehouse inventory and storage' },
    { key: 'retailers', label: 'Retailers/Distributors', icon: Store, description: 'Retailer and distributor data' }
  ];

  const handleFileSelect = (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please select a valid Excel or CSV file');
      return;
    }

    // Remove existing file of same type
    setSelectedFiles(prev => prev.filter(f => f.type !== type));

    // Add new file
    const newFile: FileUpload = {
      file,
      type,
      status: 'pending',
      progress: 0
    };

    setSelectedFiles(prev => [...prev, newFile]);
    setError(null);
  };

  const removeFile = (type: string) => {
    setSelectedFiles(prev => prev.filter(f => f.type !== type));
    if (fileInputRefs.current[type]) {
      fileInputRefs.current[type]!.value = '';
    }
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileSpreadsheet className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'uploading':
        return 'Uploading files...';
      case 'ai-mapping':
        return 'AI mapping data...';
      case 'saving':
        return 'Saving to database...';
      case 'completed':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploadStatus('uploading');
    setOverallProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add all selected files to form data
      selectedFiles.forEach(fileUpload => {
        formData.append(fileUpload.type, fileUpload.file);
      });

      // Update file statuses to uploading
      setSelectedFiles(prev => 
        prev.map(f => ({ ...f, status: 'uploading' as const, progress: 0 }))
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setOverallProgress(prev => {
          if (prev >= 30) {
            clearInterval(progressInterval);
            return 30;
          }
          return prev + 5;
        });
      }, 200);

      // Make API call
      const response = await fetch('/api/data-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadStatus('ai-mapping');
      setOverallProgress(30);

      // Simulate AI mapping progress
      const aiProgressInterval = setInterval(() => {
        setOverallProgress(prev => {
          if (prev >= 70) {
            clearInterval(aiProgressInterval);
            return 70;
          }
          return prev + 8;
        });
      }, 300);

      // Simulate saving progress
      setTimeout(() => {
        clearInterval(aiProgressInterval);
        setUploadStatus('saving');
        setOverallProgress(70);
        
        setTimeout(() => {
          setUploadStatus('completed');
          setOverallProgress(100);
          
          // Update file statuses to completed
          setSelectedFiles(prev => 
            prev.map(f => ({ ...f, status: 'completed' as const, progress: 100 }))
          );
          
          // Refresh the data history
          setRefreshKey(prev => prev + 1);
        }, 1000);
      }, 3000);

    } catch (error) {
      setUploadStatus('error');
      setError(error instanceof Error ? error.message : 'Upload failed');
      
      // Update file statuses to error
      setSelectedFiles(prev => 
        prev.map(f => ({ ...f, status: 'error' as const, error: 'Upload failed' }))
      );
    }
  };

  const resetUpload = () => {
    setSelectedFiles([]);
    setUploadStatus('idle');
    setOverallProgress(0);
    setError(null);
    
    // Clear all file inputs
    Object.values(fileInputRefs.current).forEach(ref => {
      if (ref) ref.value = '';
    });
    
    // Refresh the data history to show latest uploads
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      {uploadStatus !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadStatus === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : uploadStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              {getStatusText(uploadStatus)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="mb-4" />
            <div className="text-sm text-gray-600">
              {uploadStatus === 'uploading' && 'Uploading files to server...'}
              {uploadStatus === 'ai-mapping' && 'AI is analyzing and mapping your data...'}
              {uploadStatus === 'saving' && 'Saving mapped data to database...'}
              {uploadStatus === 'completed' && 'All files have been successfully processed!'}
              {uploadStatus === 'error' && 'An error occurred during upload. Please try again.'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataTypes.map(({ key, label, icon: Icon, description }) => (
          <Card key={key} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4" />
                {label}
              </CardTitle>
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* File Input */}
                <div className="relative">
                    <input
                    ref={el => { fileInputRefs.current[key] = el; }}

                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFileSelect(key, e.target.files)}
                    className="hidden"
                    disabled={uploadStatus !== 'idle'}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRefs.current[key]?.click()}
                    disabled={uploadStatus !== 'idle'}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>

                {/* Selected File Display */}
                {selectedFiles.find(f => f.type === key) && (
                  <div className="space-y-2">
                    {selectedFiles
                      .filter(f => f.type === key)
                      .map((fileUpload, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(fileUpload.status)}
                            <span className="text-sm truncate">{fileUpload.file.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {fileUpload.status === 'uploading' && (
                              <Badge variant="secondary" className="text-xs">
                                {fileUpload.progress}%
                              </Badge>
                            )}
                            {fileUpload.status === 'completed' && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Complete
                              </Badge>
                            )}
                            {fileUpload.status === 'error' && (
                              <Badge variant="destructive" className="text-xs">
                                Error
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(key)}
                              disabled={uploadStatus !== 'idle'}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedFiles.length > 0 && (
            <span>{selectedFiles.length} file(s) selected</span>
          )}
        </div>
        
        <div className="flex gap-3">
          {uploadStatus === 'completed' ? (
            <Button onClick={resetUpload} variant="outline">
              Upload More Files
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={resetUpload}
                disabled={uploadStatus !== 'idle'}
              >
                Reset
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadStatus !== 'idle'}
                className="min-w-[140px]"
              >
                {uploadStatus === 'idle' ? (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
              <Separator />
       
       {/* View Live Data Button */}
       {uploadStatus === 'completed' && (
         <Card>
           <CardContent className="pt-6">
             <div className="text-center">
               <p className="text-sm text-gray-600 mb-4">
                 Your data has been successfully uploaded and processed!
               </p>
               <Button 
                 onClick={() => {
                   const event = new CustomEvent('changeSection', { 
                     detail: { section: 'live-data', dataType: 'overview' } 
                   });
                   window.dispatchEvent(event);
                 }}
                 className="mx-auto"
               >
                 <Activity className="h-4 w-4 mr-2" />
                 View Live Data
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
       
       <DataHistory refreshKey={refreshKey} />
     </div>
   );
 }
