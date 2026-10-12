import { Search, Mountain } from 'lucide-react';
import { useState } from 'react';

type Filter = 'all' | 'favorites' | (string & {});

type HeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  cities: string[];
};


export default function Header({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  cities,
}: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Keşfet' },
    ...cities.map((c) => ({ key: c as Filter, label: c })),
    { key: 'favorites', label: 'Favoriler' },
  ];

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-surface-800/60">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
            <Mountain className="w-5 h-5 text-surface-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Terra<span className="text-brand-400">View</span>
          </h1>
        </div>

        <div
          className={`relative flex items-center transition-all duration-200 ${
            searchFocused ? 'ring-2 ring-brand-500/40' : ''
          }`}
        >
          <Search className="absolute left-3.5 w-4 h-4 text-surface-200/60 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Duvar kağıdı ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-800/80 text-sm text-white placeholder:text-surface-200/40 border border-surface-700/50 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeFilter === filter.key
                ? 'bg-brand-500 text-surface-950 shadow-md shadow-brand-500/20'
                : 'bg-surface-800/60 text-surface-200/70 hover:bg-surface-700/60 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </header>
  );
}
