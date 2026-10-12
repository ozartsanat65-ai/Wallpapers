import { MapPin } from 'lucide-react';
import type { Wallpaper } from '@/lib/supabase';

type CategoryGridProps = {
  wallpapers: Wallpaper[];
  onCategoryClick: (city: string) => void;
};

export default function CategoryGrid({ wallpapers, onCategoryClick }: CategoryGridProps) {
  const cities = [...new Set(wallpapers.map((w) => w.city))].sort();

  const getCityData = (city: string) => {
    const cityWallpapers = wallpapers.filter((w) => w.city === city);
    const cover = cityWallpapers[0]?.image_url;
    const count = cityWallpapers.length;
    return { cover, count };
  };

  return (
    <div className="px-4 py-4">
      <h2 className="text-lg font-bold text-white mb-1">Şehir Kategorileri</h2>
      <p className="text-sm text-surface-200/50 mb-4">Bir şehir seçerek keşfedin</p>

      <div className="space-y-3">
        {cities.map((city) => {
          const { cover, count } = getCityData(city);
          return (
            <button
              key={city}
              onClick={() => onCategoryClick(city)}
              className="relative w-full h-32 rounded-2xl overflow-hidden group animate-scale-in"
            >
              {cover && (
                <img
                  src={cover}
                  alt={city}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="relative h-full flex flex-col justify-center px-5">
                <div className="flex items-center gap-1.5 text-brand-300 mb-1">
                  <MapPin className="w-4 h-4" strokeWidth={2.5} />
                  <span className="text-xs font-medium">{count} duvar kağıdı</span>
                </div>
                <h3 className="text-2xl font-bold text-white">{city}</h3>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
