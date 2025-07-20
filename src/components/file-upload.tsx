import React, { useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadSuccess: (result: { fileUrl: string; fileId: string; fileName: string }) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({ 
  onUploadSuccess, 
  accept = ".pdf,.doc,.docx",
  maxSize = 5,
  className 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const uploadMutation = useFileUpload();
  const { toast } = useToast();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded`,
        });
        onUploadSuccess(result);
      },
      onError: (error) => {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          "hover:bg-gray-50 cursor-pointer",
          dragActive ? "border-primary bg-blue-50" : "border-gray-300",
          uploadMutation.isPending && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {uploadMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : uploadMutation.isSuccess ? (
            <>
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-green-600">Upload successful!</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Drop your CV here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX up to {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadMutation.isPending && (
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
        </div>
      )}
    </div>
  );
}