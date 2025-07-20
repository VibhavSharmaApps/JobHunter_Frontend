import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UploadResponse {
  fileUrl: string;
  fileId: string;
  fileName: string;
}

export function useFileUpload() {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and Word documents are allowed');
      }

      // Get presigned URL from backend
      const presignedResponse = await apiRequest('POST', '/api/upload/presign', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      const { uploadUrl, fileUrl, fileId } = await presignedResponse.json();

      // Upload directly to R2 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Confirm upload with backend
      await apiRequest('POST', '/api/upload/confirm', {
        fileId,
        fileName: file.name,
      });

      return {
        fileUrl,
        fileId,
        fileName: file.name,
      };
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });
}

// Usage in your components:
// const uploadMutation = useFileUpload();
// uploadMutation.mutate(file);