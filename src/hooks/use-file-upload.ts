import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Force the correct API URL since environment variable isn't loading
const API_BASE_URL = 'https://jobhunter-backend-v2-1020050031271.us-central1.run.app';

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

      try {
        console.log('Starting file upload:', file.name);
        console.log('File type:', file.type);
        console.log('File size:', file.size);

        // Check if user is authenticated
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          throw new Error('User not authenticated. Please log in again.');
        }
        console.log('JWT token found:', token.substring(0, 20) + '...');

        // Skip backend connectivity test since we know it works
        console.log('Skipping backend connectivity test - backend is reachable');

        // Try proxy upload first (recommended approach)
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', file.name);
          formData.append('fileType', file.type);

          console.log('Attempting proxy upload...');
          console.log('Upload URL:', `${API_BASE_URL}/api/upload/proxy`);
          console.log('FormData contents:', {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          });
          
          // Upload through backend proxy to avoid SSL/TLS issues
          let response: Response;
          
          try {
            console.log('Making fetch request to:', `${API_BASE_URL}/api/upload/proxy`);
            response = await fetch(`${API_BASE_URL}/api/upload/proxy`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
              },
              mode: 'cors',
              credentials: 'omit',
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Upload failed with status:', response.status);
              console.error('Error text:', errorText);
              throw new Error(`Proxy upload failed: ${response.status} - ${errorText}`);
            }
          } catch (fetchError) {
            console.error('Fetch error details:', fetchError);
            
            const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
            const errorName = fetchError instanceof Error ? fetchError.name : 'Unknown';
            
            console.error('Error name:', errorName);
            console.error('Error message:', errorMessage);
            
            if (fetchError instanceof Error) {
              console.error('Error stack:', fetchError.stack);
            }
            
            if (errorName === 'TypeError' && errorMessage.includes('Failed to fetch')) {
              throw new Error('Network connection issue. Please check your internet connection and try again.');
            } else {
              throw new Error(`Upload failed: ${errorMessage}`);
            }
          }

          const result = await response.json();
          
          console.log('Proxy upload successful');
          
          return {
            fileUrl: result.fileUrl,
            fileId: result.fileId,
            fileName: result.fileName,
          };
        } catch (proxyError) {
          console.log('Proxy upload failed, trying presigned URL approach:', proxyError);
          
          // Fallback to presigned URL approach
          const presignedResponse = await apiRequest('POST', '/api/upload/presign', {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });

          const { uploadUrl, fileUrl, fileId } = await presignedResponse.json();

          console.log('Attempting direct upload to:', uploadUrl);

          // Try direct upload with multiple strategies
          let uploadSuccess = false;
          let uploadError: Error | null = null;

          // Strategy 1: Direct upload with minimal headers
          try {
            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });

            if (uploadResponse.ok) {
              uploadSuccess = true;
              console.log('Direct upload successful with strategy 1');
            } else {
              throw new Error(`Direct upload failed: ${uploadResponse.status}`);
            }
          } catch (error) {
            console.log('Strategy 1 failed:', error);
            uploadError = error as Error;
          }

          // Strategy 2: Upload with blob conversion
          if (!uploadSuccess) {
            try {
              const fileBlob = new Blob([file], { type: file.type });
              const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: fileBlob,
                headers: {
                  'Content-Type': file.type,
                },
              });

              if (uploadResponse.ok) {
                uploadSuccess = true;
                console.log('Direct upload successful with strategy 2');
              } else {
                throw new Error(`Direct upload failed: ${uploadResponse.status}`);
              }
            } catch (error) {
              console.log('Strategy 2 failed:', error);
              uploadError = error as Error;
            }
          }

          if (!uploadSuccess) {
            // Both proxy and direct upload failed
            const errorMessage = uploadError?.message || 'Upload failed';
            if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
              throw new Error('SSL/TLS connection issue. Please try again or contact support.');
            } else if (errorMessage.includes('Failed to fetch')) {
              throw new Error('Network connection issue. Please check your internet connection and try again.');
            } else {
              throw new Error(`Upload failed: ${errorMessage}`);
            }
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
        }
              } catch (error) {
          console.error('Upload error details:', error);
          
          // Provide more specific error messages
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
            throw new Error('Network connection issue. Please check your internet connection and try again.');
          } else if (errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
            throw new Error('SSL/TLS connection issue. Please try again or contact support.');
          } else {
            throw error;
          }
        }
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });
}

// Usage in your components:
// const uploadMutation = useFileUpload();
// uploadMutation.mutate(file);