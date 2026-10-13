import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase bağlantısı yapılandırılmamış');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Wallpaper = {
  id: string;
  title: string;
  city: string;
  image_url: string;
  category: string;
  downloads: number;
  likes: number;
  created_at: string;
};

export function getWallpaperImageUrl(imageValue: string): string {
  const value = imageValue.trim();
  if (!value) return '';

  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return value;
  } catch {
    // Storage paths are resolved below.
  }

  const path = value.replace(/^\/+/, '').replace(/^wallpapers\//, '');
  return supabase.storage.from('wallpapers').getPublicUrl(path).data.publicUrl;
}
