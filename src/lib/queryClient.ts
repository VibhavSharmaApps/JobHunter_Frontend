import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Debug: Log the API base URL
console.log('API_BASE_URL:', API_BASE_URL);

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
  // Ensure absolute URL for production
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Debug: Log the full URL being requested
  console.log('Making request to:', fullUrl);
  
  // Get JWT token from localStorage
  const token = localStorage.getItem('jwt_token');
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

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
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

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