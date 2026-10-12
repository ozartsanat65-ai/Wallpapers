import { X, Download, Heart, MapPin, Monitor, Share2, ImageOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWallpaperImageUrl, type Wallpaper } from '@/lib/supabase';

type WallpaperDetailModalProps = {
  wallpaper: Wallpaper | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onDownload: (wallpaper: Wallpaper) => void;
};

export default function WallpaperDetailModal({
  wallpaper,
  isFavorite,
  onToggleFavorite,
  onClose,
  onDownload,
}: WallpaperDetailModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [wallpaper]);

  useEffect(() => {
    if (wallpaper) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [wallpaper]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!wallpaper) return null;

  const imageUrl = getWallpaperImageUrl(wallpaper.image_url);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload(wallpaper);
    } finally {
      setDownloading(false);
    }
  };

  const handleSetWallpaper = async () => {
    setDownloading(true);
    try {
      await onDownload(wallpaper);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${wallpaper.title} - ${wallpaper.city}`,
          text: 'TerraView ile keşfet',
          url: imageUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(imageUrl);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90" />

      <div className="relative flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-strong transition-all active:scale-90"
            aria-label="Kapat"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full glass-strong transition-all active:scale-90"
              aria-label="Paylaş"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => onToggleFavorite(wallpaper.id)}
              className="w-10 h-10 flex items-center justify-center rounded-full glass-strong transition-all active:scale-90"
              aria-label="Favori"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFavorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          {imgError ? (
            <div className="flex flex-col items-center justify-center gap-3 text-white/40">
              <ImageOff className="w-12 h-12" />
              <p className="text-sm">Görsel yüklenemedi</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-400 underline"
              >
                Görseli yeni sekmede aç
              </a>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={wallpaper.title}
              onError={() => setImgError(true)}
              className="max-w-full max-h-full rounded-2xl object-contain animate-scale-in"
            />
          )}
        </div>

        {/* Info and actions */}
        <div className="px-4 pb-[env(safe-area-inset-bottom)] pt-3 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-brand-500/20 text-brand-300">
              <MapPin className="w-3 h-3" strokeWidth={2.5} />
              {wallpaper.city}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white/70 bg-white/10">
              {wallpaper.category}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{wallpaper.title}</h2>
          <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              {wallpaper.likes} beğeni
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-4 h-4" />
              {wallpaper.downloads} indirme
            </span>
          </div>

          <div className="flex gap-3 pb-4">
            <button
              onClick={handleSetWallpaper}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-500 text-surface-950 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-500/20"
            >
              <Monitor className="w-5 h-5" />
              {downloading ? 'İndiriliyor...' : 'Duvar Kağıdı Yap'}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-surface-800 text-white font-semibold text-sm border border-surface-700/60 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {downloading ? '...' : 'İndir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
