import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL format to prevent uncaught initialisation errors with placeholder tokens
const isValidUrl = (url: string) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  !supabaseUrl.includes('YOUR_SUPABASE_URL') &&
  isValidUrl(supabaseUrl)
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Creates a JWT-like token signature-less payload on the client side
 * for our mock authentication, enabling robust sandbox sessions.
 */
export function signMockToken(email: string): string {
  const payload = {
    email,
    sub: email,
    id: email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days expiry
  };
  const header = { alg: 'none', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  return `${encodedHeader}.${encodedPayload}.mock_signature`;
}
