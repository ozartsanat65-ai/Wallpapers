import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
