import { Heart, MapPin, Download, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { getWallpaperImageUrl, type Wallpaper } from '@/lib/supabase';

type WallpaperCardProps = {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: (wallpaper: Wallpaper) => void;
};

export default function WallpaperCard({
  wallpaper,
  isFavorite,
  onToggleFavorite,
  onClick,
}: WallpaperCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imageUrl = getWallpaperImageUrl(wallpaper.image_url);

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group bg-surface-800 animate-scale-in"
      onClick={() => onClick(wallpaper)}
    >
      <div className="aspect-[3/4] relative">
        {!loaded && !errored && (
          <div className="absolute inset-0 image-loading" />
        )}
        {errored ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-surface-200/30">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs">Görsel yüklenemedi</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={wallpaper.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(wallpaper.id);
          }}
          className="absolute top-2.5 right-2.5 w-9 h-9 flex items-center justify-center rounded-full glass-strong transition-all duration-200 active:scale-90"
          aria-label="Favori"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-all ${
              isFavorite
                ? 'text-red-500 fill-red-500 scale-110'
                : 'text-white/80'
            }`}
            strokeWidth={2}
          />
        </button>

        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white glass-strong">
            <MapPin className="w-3 h-3" strokeWidth={2.5} />
            {wallpaper.city}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
            {wallpaper.title}
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {wallpaper.likes}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {wallpaper.downloads}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/15 text-white/80 font-medium">
              {wallpaper.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
