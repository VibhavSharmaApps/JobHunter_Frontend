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