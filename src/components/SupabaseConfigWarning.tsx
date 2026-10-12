import { AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SupabaseConfigWarning() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mx-4 my-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-amber-300 mb-1">Supabase Bağlantısı Gerekli</p>
        <p className="text-amber-200/70 text-xs leading-relaxed">
          Duvar kağıtlarını yükleyebilmek için Supabase ortam değişkenleri
          yapılandırılmalı. .env dosyasında VITE_SUPABASE_URL ve
          VITE_SUPABASE_ANON_KEY tanımlı olmalı.
        </p>
      </div>
    </div>
  );
}
