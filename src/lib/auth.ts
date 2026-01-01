import { NextRequest } from 'next/server';
import { API_BASE_URL } from './api-config';

export async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get('bearer_token')?.value;
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) return null;
    const session = await response.json();
    return session?.user || null;
  } catch (error) {
    return null;
  }
}
