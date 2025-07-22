import React, { useState } from 'react';
import { useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface FileUploadProps {
  onUploadSuccess?: (result: { fileUrl: string; fileId: string; fileName: string }) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({ 
  onUploadSuccess, 
  accept = ".pdf,.doc,.docx",
  maxSize = 5,
  className 
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const uploadMutation = useFileUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setUploadStatus(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploadStatus('Uploading...');
    try {
      const result = await uploadMutation.mutateAsync(selectedFile);
      setUploadStatus(`Upload successful! File URL: ${result.fileUrl}`);
      onUploadSuccess?.(result);
    } catch (error) {
      setUploadStatus(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testR2Connection = async () => {
    setUploadStatus('Testing R2 connection...');
    try {
      // Use the apiRequest function to ensure proper URL construction
      const response = await apiRequest('POST', '/api/test-r2-upload', {});
      
      const result = await response.json();
      setUploadStatus(`R2 test successful: ${result.message}`);
    } catch (error) {
      setUploadStatus(`R2 test error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testBackendConnectivity = async () => {
    setUploadStatus('Testing backend connectivity...');
    try {
      const response = await apiRequest('GET', '/api/test-cors', {});
      const result = await response.json();
      setUploadStatus(`Backend connectivity test successful: ${result.message}`);
    } catch (error) {
      setUploadStatus(`Backend connectivity test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testSimpleBackendReachability = async () => {
    setUploadStatus('Testing simple backend reachability...');
    try {
      const response = await fetch('https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/test-cors', {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`Simple backend test successful: ${result.message}`);
      } else {
        setUploadStatus(`Simple backend test failed: ${response.status}`);
      }
    } catch (error) {
      setUploadStatus(`Simple backend test error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testSimpleR2Connection = async () => {
    setUploadStatus('Testing simple R2 connection...');
    try {
      const response = await apiRequest('GET', '/api/test-r2-connection', {});
      const result = await response.json();
      setUploadStatus(`Simple R2 test successful: ${result.message}`);
    } catch (error) {
      setUploadStatus(`Simple R2 test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const debugR2Config = async () => {
    setUploadStatus('Checking R2 configuration...');
    try {
      const response = await apiRequest('GET', '/api/debug-r2-config', {});
      const result = await response.json();
      setUploadStatus(`R2 Config: Endpoint=${result.endpoint}, Bucket=${result.bucket}, HasKeys=${result.hasAccessKey && result.hasSecretKey}`);
    } catch (error) {
      setUploadStatus(`Debug failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testR2Endpoints = async () => {
    setUploadStatus('Testing multiple R2 endpoints...');
    try {
      const response = await apiRequest('GET', '/api/test-r2-endpoints', {});
      const result = await response.json();
      
      const successResults = result.results.filter((r: any) => r.status === 'SUCCESS');
      if (successResults.length > 0) {
        setUploadStatus(`✅ Working endpoint found: ${successResults[0].endpoint}`);
      } else {
        setUploadStatus(`❌ All endpoints failed. Check account ID and R2 setup.`);
      }
    } catch (error) {
      setUploadStatus(`Endpoint test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testProxyUpload = async () => {
    setUploadStatus('Testing proxy upload endpoint...');
    try {
      // Create a simple test PDF file (minimal PDF content)
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
      const testFile = new File([pdfContent], 'test.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('fileName', 'test.pdf');
      formData.append('fileType', 'application/pdf');

      const response = await fetch('https://jobhunter-backend-v2-1020050031271.us-central1.run.app/api/upload/proxy', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(`✅ Proxy upload test successful: ${result.message}`);
      } else {
        const errorText = await response.text();
        setUploadStatus(`❌ Proxy upload test failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setUploadStatus(`Proxy upload test error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testSupabase = async () => {
    setUploadStatus('Testing Supabase connection...');
    try {
      const response = await apiRequest('GET', '/api/test-supabase', {});
      const result = await response.json();
      setUploadStatus(`✅ Supabase test successful: ${result.message}`);
    } catch (error) {
      setUploadStatus(`❌ Supabase test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload CV
        </CardTitle>
        <CardDescription>
          Upload your CV in PDF or Word format (max {maxSize}MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="w-full"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload CV
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={testR2Connection}
              variant="outline"
              size="sm"
            >
              Test R2
            </Button>
            
            <Button
              onClick={testBackendConnectivity}
              variant="outline"
              size="sm"
            >
              Test Backend
            </Button>
            
            <Button
              onClick={testSimpleBackendReachability}
              variant="outline"
              size="sm"
            >
              Test Simple Backend
            </Button>
            
            <Button
              onClick={testSimpleR2Connection}
              variant="outline"
              size="sm"
            >
              Test Simple R2
            </Button>
            
            <Button
              onClick={debugR2Config}
              variant="outline"
              size="sm"
            >
              Debug R2 Config
            </Button>
            
            <Button
              onClick={testR2Endpoints}
              variant="outline"
              size="sm"
            >
              Test R2 Endpoints
            </Button>
            
            <Button
              onClick={testProxyUpload}
              variant="outline"
              size="sm"
            >
              Test Proxy Upload
            </Button>

            <Button
              onClick={testSupabase}
              variant="outline"
              size="sm"
            >
              Test Supabase
            </Button>
          </div>
        </div>

        {uploadStatus && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadStatus}</AlertDescription>
          </Alert>
        )}

        {uploadMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {uploadMutation.error.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}