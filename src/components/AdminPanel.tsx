import { useState } from 'react';
import { Plus, Trash2, Loader2, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import { getWallpaperImageUrl, supabase, type Wallpaper } from '@/lib/supabase';

type AdminPanelProps = {
  wallpapers: Wallpaper[];
  onRefresh: () => void;
};

type FormState = {
  title: string;
  city: string;
  image_url: string;
  category: string;
};

const CATEGORIES = ['Şehir', 'Sahil', 'Doğa', 'Göl', 'Dağ', 'Genel'];

export default function AdminPanel({ wallpapers, onRefresh }: AdminPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    city: 'İstanbul',
    image_url: '',
    category: 'Genel',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) return;

    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('wallpapers').insert({
        title: form.title,
        city: form.city,
        image_url: form.image_url,
        category: form.category,
      });
      if (insertError) throw insertError;

      setSuccess(true);
      setForm({ title: '', city: 'İstanbul', image_url: '', category: 'Genel' });
      setTimeout(() => setSuccess(false), 2500);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ekleme başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('wallpapers')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setDeleteId(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme başarısız');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">Yönetim Paneli</h2>
          <p className="text-sm text-surface-200/50">
            {wallpapers.length} duvar kağıdı
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
            showForm
              ? 'bg-surface-800 text-white border border-surface-700/60'
              : 'bg-brand-500 text-surface-950 shadow-lg shadow-brand-500/20'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'İptal' : 'Yeni Ekle'}
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0" />
          <p className="text-sm text-brand-300">Duvar kağıdı başarıyla eklendi!</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5">
          <p className="text-sm text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="flex-shrink-0">
            <X className="w-4 h-4 text-red-300" />
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-2xl bg-surface-800/60 border border-surface-700/50 space-y-4 animate-slide-up"
        >
          <div>
            <label className="block text-sm font-medium text-surface-200/70 mb-1.5">
              Başlık
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Duvar kağıdı başlığı"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 text-sm text-white placeholder:text-surface-200/30 border border-surface-700/50 focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-200/70 mb-1.5">
              Şehir
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Şehir adı"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 text-sm text-white placeholder:text-surface-200/30 border border-surface-700/50 focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-200/70 mb-1.5">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    form.category === cat
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      : 'bg-surface-900/80 text-surface-200/50 border border-surface-700/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-200/70 mb-1.5">
              Görsel URL
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-900/80 text-sm text-white placeholder:text-surface-200/30 border border-surface-700/50 focus:outline-none focus:border-brand-500/50 transition-all"
            />
            {form.image_url && (
              <div className="mt-2 rounded-xl overflow-hidden h-28 bg-surface-900">
                <img
                  src={getWallpaperImageUrl(form.image_url)}
                  alt="Önizleme"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-500 text-surface-950 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {submitting ? 'Ekleniyor...' : 'Duvar Kağıdı Ekle'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {wallpapers.map((wp) => (
          <div
            key={wp.id}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-800/40 border border-surface-700/30"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-900">
              {wp.image_url && (
                <img
                  src={getWallpaperImageUrl(wp.image_url)}
                  alt={wp.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate">{wp.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-surface-200/50">{wp.city}</span>
                <span className="text-xs text-surface-200/30">·</span>
                <span className="text-xs text-surface-200/50">{wp.category}</span>
                <span className="text-xs text-surface-200/30">·</span>
                <span className="text-xs text-surface-200/50">
                  {wp.downloads} indirme
                </span>
              </div>
            </div>
            {deleteId === wp.id ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDelete(wp.id)}
                  disabled={deleting}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Onayla'}
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-700/50 text-surface-200/60 text-xs font-medium"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteId(wp.id)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-700/40 text-surface-200/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                aria-label="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {wallpapers.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <ImageIcon className="w-10 h-10 text-surface-200/30 mb-2" />
            <p className="text-sm text-surface-200/40">Henüz duvar kağıdı eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
}
