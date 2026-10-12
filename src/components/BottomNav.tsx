import { Compass, LayoutGrid, Heart, Shield } from 'lucide-react';

export type Tab = 'explore' | 'categories' | 'favorites' | 'admin';

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  favoritesCount: number;
};

const NAV_ITEMS: { key: Tab; label: string; icon: typeof Compass }[] = [
  { key: 'explore', label: 'Keşfet', icon: Compass },
  { key: 'categories', label: 'Kategoriler', icon: LayoutGrid },
  { key: 'favorites', label: 'Favoriler', icon: Heart },
  { key: 'admin', label: 'Yönetim', icon: Shield },
];

export default function BottomNav({
  activeTab,
  onTabChange,
  favoritesCount,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-surface-800/60 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-brand-400 scale-110'
                      : 'text-surface-200/50'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.key === 'favorites' && favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-surface-950 bg-brand-400 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-brand-400' : 'text-surface-200/50'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
