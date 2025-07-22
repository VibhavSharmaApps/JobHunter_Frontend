import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Force the correct API URL since environment variable isn't loading
const API_BASE_URL = 'https://jobhunter-backend-v2-1020050031271.us-central1.run.app';

// Check if we're in development mode (using proxy)
const isDevelopment = import.meta.env.DEV;

// CORS proxy for production (if backend doesn't support CORS)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Debug: Log the API base URL
console.log('API_BASE_URL:', API_BASE_URL);
console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('import.meta.env:', import.meta.env);
console.log('isDevelopment:', isDevelopment);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // In development, use relative URLs to work with the proxy
  // In production, use absolute URLs
  let fullUrl = isDevelopment 
    ? url.startsWith('http') ? url : url
    : url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // For production, if CORS is still an issue, use a CORS proxy
  if (!isDevelopment && !url.startsWith('http')) {
    // Uncomment the next line if you want to use a CORS proxy
    // fullUrl = `${CORS_PROXY}${API_BASE_URL}${url}`;
  }
  
  // Debug: Log the full URL being requested
  console.log('Making request to:', fullUrl);
  console.log('Original url:', url);
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('isDevelopment:', isDevelopment);
  
  // Get JWT token from localStorage
  const token = localStorage.getItem('jwt_token');
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // For production, try different CORS approaches
  const fetchOptions: RequestInit = {
    method,
    headers,
  };
  
  // Only add body for non-GET/HEAD requests
  if (data && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(data);
  }
  
  // Only add CORS mode in production
  if (!isDevelopment) {
    fetchOptions.mode = 'cors';
    fetchOptions.credentials = 'omit'; // Try 'omit' instead of 'include'
  }
  
  const res = await fetch(fullUrl, fetchOptions);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle both relative and absolute URLs
    const url = queryKey[0] as string;
    let fullUrl = isDevelopment 
      ? url.startsWith('http') ? url : url
      : url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    // For production, if CORS is still an issue, use a CORS proxy
    if (!isDevelopment && !url.startsWith('http')) {
      // Uncomment the next line if you want to use a CORS proxy
      // fullUrl = `${CORS_PROXY}${API_BASE_URL}${url}`;
    }
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const fetchOptions: RequestInit = {
      headers,
    };
    
    // Only add CORS mode in production
    if (!isDevelopment) {
      fetchOptions.mode = 'cors';
      fetchOptions.credentials = 'omit';
    }
    
    const res = await fetch(fullUrl, fetchOptions);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity for better UX
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.message.startsWith('4')) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});