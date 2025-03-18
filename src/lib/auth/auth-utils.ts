import { auth } from '@/lib/firebase/firebase';
import { redirect } from 'next/navigation';

export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

export const fetchWithAuth = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getIdToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// Middleware function for client components
export const requireAuth = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
};