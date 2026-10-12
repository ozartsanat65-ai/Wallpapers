import { ImageOff, Heart } from 'lucide-react';

type EmptyStateProps = {
  type: 'no-results' | 'no-favorites' | 'error' | 'general';
  message?: string;
  onAction?: () => void;
  actionLabel?: string;
};

export default function EmptyState({
  type,
  message,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  const config = {
    'no-results': {
      icon: ImageOff,
      title: 'Sonuç Bulunamadı',
      defaultMsg: 'Aramanıza uygun duvar kağıdı bulunamadı. Farklı bir kelime deneyin.',
    },
    'no-favorites': {
      icon: Heart,
      title: 'Henüz Favori Yok',
      defaultMsg: 'Beğendiğiniz duvar kağıtlarına kalp simgesine dokunarak favorilere ekleyin.',
    },
    error: {
      icon: ImageOff,
      title: 'Bir Sorun Oluştu',
      defaultMsg: 'Duvar kağıtları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
    },
    general: {
      icon: ImageOff,
      title: 'İçerik Yok',
      defaultMsg: 'Henüz içerik eklenmemiş.',
    },
  };

  const { icon: Icon, title, defaultMsg } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-surface-800/60 mb-4">
        <Icon className="w-8 h-8 text-surface-200/40" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-surface-200/50 max-w-xs leading-relaxed">
        {message || defaultMsg}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-xl bg-brand-500 text-surface-950 text-sm font-semibold transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
