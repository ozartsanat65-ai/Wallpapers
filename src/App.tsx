import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { getWallpaperImageUrl, supabase, type Wallpaper } from '@/lib/supabase';
import { getFavorites, toggleFavorite } from '@/lib/favorites';

import Header from '@/components/Header';
import BottomNav, { type Tab } from '@/components/BottomNav';
import WallpaperCard from '@/components/WallpaperCard';
import WallpaperDetailModal from '@/components/WallpaperDetailModal';
import CategoryGrid from '@/components/CategoryGrid';
import AdminPanel from '@/components/AdminPanel';
import EmptyState from '@/components/EmptyState';
import SupabaseConfigWarning from '@/components/SupabaseConfigWarning';

type Filter = 'all' | 'favorites' | (string & {});

export default function App() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [activeTab, setActiveTab] = useState<Tab>('explore');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);

  const cities = useMemo(
    () => [...new Set(wallpapers.map((w) => w.city))].sort(),
    [wallpapers]
  );

  const fetchWallpapers = useCallback(async () => {
    setLoading(true);
    setError(false);
    setErrorMsg(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('wallpapers')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setWallpapers((data as Wallpaper[]) || []);
    } catch (err) {
      setError(true);
      setErrorMsg(err instanceof Error ? err.message : 'Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallpapers();
    setFavorites(getFavorites());
  }, [fetchWallpapers]);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites(toggleFavorite(id));
  }, []);

  const handleFilterChange = (filter: Filter) => {
    setActiveFilter(filter);
    if (filter === 'favorites') {
      setActiveTab('favorites');
    } else {
      setActiveTab('explore');
    }
  };

  const handleDownload = useCallback(
    async (wallpaper: Wallpaper) => {
      try {
        await supabase
          .from('wallpapers')
          .update({ downloads: wallpaper.downloads + 1 })
          .eq('id', wallpaper.id);

        setWallpapers((prev) =>
          prev.map((w) =>
            w.id === wallpaper.id ? { ...w, downloads: w.downloads + 1 } : w
          )
        );

        const response = await fetch(getWallpaperImageUrl(wallpaper.image_url));
        if (!response.ok) throw new Error('Görsel yüklenemedi');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `terraview-${wallpaper.city}-${wallpaper.title}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        window.open(wallpaper.image_url, '_blank');
      }
    },
    []
  );

  const filteredWallpapers = wallpapers.filter((wp) => {
    const matchesSearch =
      !search ||
      wp.title.toLowerCase().includes(search.toLowerCase()) ||
      wp.city.toLowerCase().includes(search.toLowerCase()) ||
      wp.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'favorites' && favorites.includes(wp.id)) ||
      wp.city === activeFilter;


    return matchesSearch && matchesFilter;
  });

  const favoriteWallpapers = wallpapers.filter((wp) =>
    favorites.includes(wp.id)
  );

  const showHeaderSearch = activeTab === 'explore' || activeTab === 'favorites';

  return (
    <div className="min-h-screen bg-surface-950">
      <SupabaseConfigWarning />

      {showHeaderSearch && (
        <Header
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          cities={cities}
        />
      )}

      {!showHeaderSearch && (
        <header className="sticky top-0 z-30 glass-strong border-b border-surface-800/60 px-4 py-3">
          <h2 className="text-lg font-bold text-white">
            {activeTab === 'categories' && 'Kategoriler'}
            {activeTab === 'admin' && 'Yönetim Paneli'}
          </h2>
        </header>
      )}

      <main className="pb-24">
        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-brand-400" />
              </div>
            ) : error ? (
              <EmptyState
                type="error"
                message={errorMsg || undefined}
                onAction={fetchWallpapers}
                actionLabel="Tekrar Dene"
              />
            ) : filteredWallpapers.length === 0 ? (
              <EmptyState type="no-results" />
            ) : (
              <div className="px-4 py-4 grid grid-cols-2 gap-3">
                {filteredWallpapers.map((wp) => (
                  <WallpaperCard
                    key={wp.id}
                    wallpaper={wp}
                    isFavorite={favorites.includes(wp.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={setSelectedWallpaper}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-brand-400" />
              </div>
            ) : (
              <CategoryGrid
                wallpapers={wallpapers}
                onCategoryClick={(city) => {
                  setActiveFilter(city as Filter);
                  setActiveTab('explore');
                }}
              />
            )}
          </>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-brand-400" />
              </div>
            ) : favoriteWallpapers.length === 0 ? (
              <EmptyState
                type="no-favorites"
                onAction={() => {
                  setActiveFilter('all');
                  setActiveTab('explore');
                }}
                actionLabel="Keşfetmeye Başla"
              />
            ) : (
              <div className="px-4 py-4 grid grid-cols-2 gap-3">
                {favoriteWallpapers.map((wp) => (
                  <WallpaperCard
                    key={wp.id}
                    wallpaper={wp}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={setSelectedWallpaper}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <AdminPanel wallpapers={wallpapers} onRefresh={fetchWallpapers} />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        favoritesCount={favorites.length}
      />

      <WallpaperDetailModal
        wallpaper={selectedWallpaper}
        isFavorite={
          selectedWallpaper ? favorites.includes(selectedWallpaper.id) : false
        }
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setSelectedWallpaper(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
