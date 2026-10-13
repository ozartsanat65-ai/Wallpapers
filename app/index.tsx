import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFavorites, toggleFavorite } from '@/lib/favorites';
import { getWallpaperImageUrl, supabase, type Wallpaper } from '@/lib/supabase';

type Tab = 'explore' | 'categories' | 'favorites' | 'admin';
type Filter = 'all' | 'favorites' | string;
type IconName = keyof typeof Ionicons.glyphMap;

type WallpaperCardProps = {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPress: (wallpaper: Wallpaper) => void;
};

const COLORS = {
  background: '#0a0e18',
  surface: '#171e2e',
  surfaceStrong: '#0f1420',
  border: '#273449',
  text: '#f8fafc',
  muted: '#94a3b8',
  brand: '#10b981',
  brandLight: '#6ee7b7',
  danger: '#f87171',
};
const CATEGORIES = ['Şehir', 'Sahil', 'Doğa', 'Göl', 'Dağ', 'Genel'];

function Icon({ name, color = COLORS.text, size = 20 }: { name: IconName; color?: string; size?: number }) {
  return <Ionicons name={name} color={color} size={size} />;
}

function WallpaperCard({ wallpaper, isFavorite, onToggleFavorite, onPress }: WallpaperCardProps) {
  const [failed, setFailed] = useState(false);
  const imageUrl = getWallpaperImageUrl(wallpaper.image_url);

  return (
    <Pressable style={styles.card} onPress={() => onPress(wallpaper)}>
      {failed || !imageUrl ? (
        <View style={[styles.cardImage, styles.imageFallback]}>
          <Icon name="image-outline" color="#64748b" size={32} />
          <Text style={styles.fallbackText}>Görsel yüklenemedi</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.cardGradient} />
      <Pressable
        style={styles.favoriteButton}
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite(wallpaper.id);
        }}
      >
        <Icon name={isFavorite ? 'heart' : 'heart-outline'} color={isFavorite ? '#fb7185' : COLORS.text} size={19} />
      </Pressable>
      <View style={styles.cityPill}>
        <Icon name="location-outline" color={COLORS.text} size={12} />
        <Text style={styles.cityPillText}>{wallpaper.city}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{wallpaper.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}><Icon name="heart-outline" color={COLORS.muted} size={12} /> {wallpaper.likes}</Text>
          <Text style={styles.metaText}><Icon name="download-outline" color={COLORS.muted} size={12} /> {wallpaper.downloads}</Text>
          <Text style={styles.categoryBadge}>{wallpaper.category}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><Icon name="images-outline" color="#64748b" size={32} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction ? <Pressable style={styles.primaryButton} onPress={onAction}><Text style={styles.primaryButtonText}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

function DetailModal({ wallpaper, favorite, onClose, onToggleFavorite, onRefresh }: { wallpaper: Wallpaper | null; favorite: boolean; onClose: () => void; onToggleFavorite: (id: string) => void; onRefresh: () => void }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [wallpaper]);
  if (!wallpaper) return null;
  const imageUrl = getWallpaperImageUrl(wallpaper.image_url);

  const openImage = async () => {
    try {
      await supabase.from('wallpapers').update({ downloads: wallpaper.downloads + 1 }).eq('id', wallpaper.id);
      await Linking.openURL(imageUrl);
      onRefresh();
    } catch {
      Alert.alert('Görsel açılamadı', 'Bu görsel için geçerli bir adres bulunamadı.');
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.detailSheet}>
          <View style={styles.detailTopBar}>
            <Pressable style={styles.iconButton} onPress={onClose}><Icon name="close" size={23} /></Pressable>
            <View style={styles.detailActions}>
              <Pressable style={styles.iconButton} onPress={() => onToggleFavorite(wallpaper.id)}>
                <Icon name={favorite ? 'heart' : 'heart-outline'} color={favorite ? '#fb7185' : COLORS.text} size={22} />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={openImage}><Icon name="share-outline" size={22} /></Pressable>
            </View>
          </View>
          <View style={styles.detailImageWrap}>
            {failed || !imageUrl ? (
              <View style={styles.detailFallback}><Icon name="image-outline" color="#64748b" size={48} /><Text style={styles.fallbackText}>Görsel yüklenemedi</Text></View>
            ) : (
              <Image source={{ uri: imageUrl }} style={styles.detailImage} resizeMode="contain" onError={() => setFailed(true)} />
            )}
          </View>
          <View style={styles.detailInfo}>
            <View style={styles.detailPills}><Text style={styles.detailCity}><Icon name="location-outline" color={COLORS.brandLight} size={14} /> {wallpaper.city}</Text><Text style={styles.detailCategory}>{wallpaper.category}</Text></View>
            <Text style={styles.detailTitle}>{wallpaper.title}</Text>
            <Text style={styles.detailStats}><Icon name="heart-outline" color={COLORS.muted} size={15} /> {wallpaper.likes} beğeni  ·  <Icon name="download-outline" color={COLORS.muted} size={15} /> {wallpaper.downloads} indirme</Text>
            <Pressable style={styles.primaryButton} onPress={openImage}><Icon name="download-outline" color={COLORS.background} size={20} /><Text style={styles.primaryButtonText}>Görseli Aç ve İndir</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AdminPanel({ wallpapers, onRefresh }: { wallpapers: Wallpaper[]; onRefresh: () => void }) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Genel');
  const [saving, setSaving] = useState(false);

  const addWallpaper = async () => {
    if (!title.trim() || !imageUrl.trim()) {
      Alert.alert('Eksik bilgi', 'Başlık ve görsel adresi gerekli.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('wallpapers').insert({ title: title.trim(), city: city.trim(), image_url: imageUrl.trim(), category });
    setSaving(false);
    if (error) {
      Alert.alert('Eklenemedi', error.message);
      return;
    }
    setTitle(''); setImageUrl(''); setCategory('Genel'); setVisible(false); onRefresh();
  };

  const deleteWallpaper = (id: string) => {
    Alert.alert('Duvar kağıdını sil', 'Bu kayıt kalıcı olarak silinecek.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { const { error } = await supabase.from('wallpapers').delete().eq('id', id); if (error) Alert.alert('Silinemedi', error.message); else onRefresh(); } },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.adminContent}>
      <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Yönetim Paneli</Text><Text style={styles.sectionSubtitle}>{wallpapers.length} duvar kağıdı</Text></View><Pressable style={styles.smallButton} onPress={() => setVisible((current) => !current)}><Icon name={visible ? 'close' : 'add'} color={COLORS.background} size={18} /><Text style={styles.smallButtonText}>{visible ? 'İptal' : 'Yeni Ekle'}</Text></Pressable></View>
      {visible ? <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Başlık</Text><TextInput value={title} onChangeText={setTitle} placeholder="Duvar kağıdı başlığı" placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.inputLabel}>Şehir</Text><TextInput value={city} onChangeText={setCity} placeholder="Şehir adı" placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.inputLabel}>Görsel adresi veya Storage yolu</Text><TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://... veya dosya-yolu.jpg" placeholderTextColor="#64748b" autoCapitalize="none" style={styles.input} />
        <Text style={styles.inputLabel}>Kategori</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>{CATEGORIES.map((item) => <Pressable key={item} style={[styles.choice, category === item && styles.choiceActive]} onPress={() => setCategory(item)}><Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{item}</Text></Pressable>)}</ScrollView>
        {imageUrl ? <Image source={{ uri: getWallpaperImageUrl(imageUrl) }} style={styles.formPreview} resizeMode="cover" /> : null}
        <Pressable style={styles.primaryButton} onPress={addWallpaper} disabled={saving}>{saving ? <ActivityIndicator color={COLORS.background} /> : <><Icon name="add" color={COLORS.background} size={20} /><Text style={styles.primaryButtonText}>Duvar Kağıdı Ekle</Text></>}</Pressable>
      </View> : null}
      {wallpapers.map((wallpaper) => <View key={wallpaper.id} style={styles.adminRow}><Image source={{ uri: getWallpaperImageUrl(wallpaper.image_url) }} style={styles.adminThumb} /><View style={styles.adminRowInfo}><Text style={styles.adminRowTitle} numberOfLines={1}>{wallpaper.title}</Text><Text style={styles.adminRowMeta}>{wallpaper.city} · {wallpaper.category}</Text></View><Pressable style={styles.deleteButton} onPress={() => deleteWallpaper(wallpaper.id)}><Icon name="trash-outline" color={COLORS.danger} size={19} /></Pressable></View>)}
    </ScrollView>
  );
}

function BottomNav({ tab, onChange, favoritesCount }: { tab: Tab; onChange: (value: Tab) => void; favoritesCount: number }) {
  const items: { key: Tab; label: string; icon: IconName }[] = [{ key: 'explore', label: 'Keşfet', icon: 'compass-outline' }, { key: 'categories', label: 'Kategoriler', icon: 'grid-outline' }, { key: 'favorites', label: 'Favoriler', icon: 'heart-outline' }, { key: 'admin', label: 'Yönetim', icon: 'shield-checkmark-outline' }];
  return <View style={styles.bottomNav}>{items.map((item) => <Pressable key={item.key} style={styles.navItem} onPress={() => onChange(item.key)}><View>{<Icon name={tab === item.key ? item.icon.replace('-outline', '') as IconName : item.icon} color={tab === item.key ? COLORS.brandLight : COLORS.muted} size={22} />}{item.key === 'favorites' && favoritesCount > 0 ? <Text style={styles.countBadge}>{favoritesCount}</Text> : null}</View><Text style={[styles.navLabel, tab === item.key && styles.navLabelActive]}>{item.label}</Text></Pressable>)}</View>;
}

export default function HomeScreen() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>('explore');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallpapers = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    const { data, error: queryError } = await supabase.from('wallpapers').select('*').order('created_at', { ascending: false });
    if (queryError) setError(queryError.message); else { setWallpapers((data as Wallpaper[]) || []); setError(null); }
    if (refresh) setRefreshing(false); else setLoading(false);
  }, []);

  useEffect(() => { loadWallpapers(); getFavorites().then(setFavorites); }, [loadWallpapers]);

  const cities = useMemo(() => [...new Set(wallpapers.map((wallpaper) => wallpaper.city))].sort(), [wallpapers]);
  const filtered = useMemo(() => wallpapers.filter((wallpaper) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || wallpaper.title.toLowerCase().includes(query) || wallpaper.city.toLowerCase().includes(query) || wallpaper.category.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || (filter === 'favorites' ? favorites.includes(wallpaper.id) : wallpaper.city === filter);
    return matchesSearch && matchesFilter;
  }), [favorites, filter, search, wallpapers]);
  const favoriteWallpapers = useMemo(() => wallpapers.filter((wallpaper) => favorites.includes(wallpaper.id)), [favorites, wallpapers]);

  const changeFilter = (value: Filter) => { setFilter(value); setTab(value === 'favorites' ? 'favorites' : 'explore'); };
  const handleFavorite = async (id: string) => setFavorites(await toggleFavorite(id));

  const renderCard = ({ item }: { item: Wallpaper }) => <WallpaperCard wallpaper={item} isFavorite={favorites.includes(item.id)} onToggleFavorite={handleFavorite} onPress={setSelected} />;
  const displayItems = tab === 'favorites' ? favoriteWallpapers : filtered;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {(tab === 'explore' || tab === 'favorites') ? <View style={styles.header}>
        <View style={styles.brandRow}><View style={styles.logo}><Icon name="leaf-outline" color={COLORS.background} size={21} /></View><Text style={styles.brand}>Terra<Text style={styles.brandAccent}>View</Text></Text></View>
        <View style={styles.searchBox}><Icon name="search" color={COLORS.muted} size={18} /><TextInput value={search} onChangeText={setSearch} placeholder="Duvar kağıdı ara..." placeholderTextColor="#64748b" style={styles.searchInput} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{[{ key: 'all', label: 'Keşfet' }, ...cities.map((city) => ({ key: city, label: city })), { key: 'favorites', label: 'Favoriler' }].map((item) => <Pressable key={item.key} style={[styles.filterPill, filter === item.key && styles.filterPillActive]} onPress={() => changeFilter(item.key)}><Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>
      </View> : <View style={styles.simpleHeader}><Text style={styles.simpleHeaderTitle}>{tab === 'categories' ? 'Kategoriler' : 'Yönetim Paneli'}</Text></View>}
      <View style={styles.content}>
        {tab === 'categories' ? <ScrollView contentContainerStyle={styles.categoryContent}>{cities.map((city) => { const cover = wallpapers.find((wallpaper) => wallpaper.city === city); return <Pressable key={city} style={styles.cityCard} onPress={() => changeFilter(city)}>{cover ? <Image source={{ uri: getWallpaperImageUrl(cover.image_url) }} style={StyleSheet.absoluteFill} /> : null}<LinearGradient colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.25)']} style={StyleSheet.absoluteFill} /><View><Text style={styles.cityCount}>{wallpapers.filter((wallpaper) => wallpaper.city === city).length} duvar kağıdı</Text><Text style={styles.cityTitle}>{city}</Text></View></Pressable>; })}</ScrollView> : tab === 'admin' ? <AdminPanel wallpapers={wallpapers} onRefresh={() => loadWallpapers(true)} /> : loading ? <View style={styles.center}><ActivityIndicator size="large" color={COLORS.brand} /></View> : error ? <EmptyState title="Bir sorun oluştu" message={error} actionLabel="Tekrar Dene" onAction={() => loadWallpapers()} /> : displayItems.length === 0 ? <EmptyState title={tab === 'favorites' ? 'Henüz favori yok' : 'Sonuç bulunamadı'} message={tab === 'favorites' ? 'Beğendiğiniz duvar kağıtlarını kalp simgesine dokunarak kaydedin.' : 'Farklı bir arama veya filtre deneyin.'} actionLabel={tab === 'favorites' ? 'Keşfetmeye Başla' : undefined} onAction={() => { setFilter('all'); setTab('explore'); }} /> : <FlatList data={displayItems} renderItem={renderCard} keyExtractor={(item) => item.id} numColumns={2} columnWrapperStyle={styles.gridRow} contentContainerStyle={styles.gridContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadWallpapers(true)} tintColor={COLORS.brand} />} />}
      </View>
      <BottomNav tab={tab} onChange={setTab} favoritesCount={favorites.length} />
      <DetailModal wallpaper={selected} favorite={selected ? favorites.includes(selected.id) : false} onClose={() => setSelected(null)} onToggleFavorite={handleFavorite} onRefresh={() => loadWallpapers(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  header: { backgroundColor: COLORS.surfaceStrong, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#182235' },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logo: { width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  brand: { color: COLORS.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  brandAccent: { color: COLORS.brandLight },
  searchBox: { height: 44, borderRadius: 13, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, marginLeft: 9 },
  filters: { gap: 8, paddingTop: 11 },
  filterPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface },
  filterPillActive: { backgroundColor: COLORS.brand },
  filterText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: COLORS.background },
  simpleHeader: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: COLORS.surfaceStrong, borderBottomWidth: 1, borderBottomColor: '#182235' },
  simpleHeaderTitle: { color: COLORS.text, fontSize: 19, fontWeight: '800' },
  gridContent: { padding: 12, paddingBottom: 90 },
  gridRow: { gap: 10, marginBottom: 10 },
  card: { flex: 1, height: 245, maxWidth: '50%', borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.surface },
  cardImage: { ...StyleSheet.absoluteFill, width: undefined, height: undefined },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#64748b', fontSize: 11, marginTop: 7 },
  cardGradient: { ...StyleSheet.absoluteFill },
  favoriteButton: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(10,14,24,0.78)', alignItems: 'center', justifyContent: 'center' },
  cityPill: { position: 'absolute', top: 11, left: 10, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(10,14,24,0.78)' },
  cityPillText: { color: COLORS.text, fontSize: 10, fontWeight: '700' },
  cardInfo: { position: 'absolute', left: 11, right: 8, bottom: 10 },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 5 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: COLORS.muted, fontSize: 10 },
  categoryBadge: { color: '#cbd5e1', fontSize: 9, backgroundColor: 'rgba(255,255,255,0.13)', paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 7 },
  emptyMessage: { color: COLORS.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 300 },
  primaryButton: { minHeight: 48, borderRadius: 13, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 18 },
  primaryButtonText: { color: COLORS.background, fontSize: 14, fontWeight: '800' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 72, backgroundColor: 'rgba(10,14,24,0.97)', borderTopWidth: 1, borderTopColor: '#182235', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  navItem: { alignItems: 'center', minWidth: 70 },
  navLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginTop: 4 },
  navLabelActive: { color: COLORS.brandLight },
  countBadge: { position: 'absolute', top: -5, right: -11, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.brandLight, color: COLORS.background, fontSize: 9, fontWeight: '800', textAlign: 'center', paddingTop: 2 },
  categoryContent: { padding: 14, paddingBottom: 90 },
  cityCard: { height: 130, borderRadius: 17, overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 20, marginBottom: 12, backgroundColor: COLORS.surface },
  cityCount: { color: COLORS.brandLight, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  cityTitle: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  adminContent: { padding: 16, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  sectionTitle: { color: COLORS.text, fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: COLORS.muted, fontSize: 13, marginTop: 3 },
  smallButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.brand, borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  smallButtonText: { color: COLORS.background, fontWeight: '800', fontSize: 12 },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 18 },
  inputLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 5 },
  input: { backgroundColor: COLORS.surfaceStrong, borderColor: COLORS.border, borderWidth: 1, borderRadius: 11, color: COLORS.text, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, marginBottom: 10 },
  choiceRow: { gap: 7, paddingBottom: 5 },
  choice: { borderRadius: 15, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: COLORS.surfaceStrong, borderWidth: 1, borderColor: COLORS.border },
  choiceActive: { backgroundColor: 'rgba(16,185,129,0.16)', borderColor: COLORS.brand },
  choiceText: { color: COLORS.muted, fontSize: 11, fontWeight: '700' },
  choiceTextActive: { color: COLORS.brandLight },
  formPreview: { height: 120, borderRadius: 11, marginTop: 10, backgroundColor: COLORS.surfaceStrong },
  adminRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: '#202d42', borderRadius: 13, padding: 9, marginBottom: 8 },
  adminThumb: { width: 54, height: 54, borderRadius: 9, backgroundColor: COLORS.surfaceStrong },
  adminRowInfo: { flex: 1, marginHorizontal: 10 },
  adminRowTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  adminRowMeta: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  deleteButton: { width: 36, height: 36, borderRadius: 9, backgroundColor: 'rgba(248,113,113,0.1)', alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  detailSheet: { height: '94%', backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  detailTopBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, zIndex: 2 },
  detailActions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(23,30,46,0.9)', alignItems: 'center', justifyContent: 'center' },
  detailImageWrap: { flex: 1, marginHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceStrong, borderRadius: 17, overflow: 'hidden' },
  detailImage: { width: '100%', height: '100%' },
  detailFallback: { alignItems: 'center' },
  detailInfo: { padding: 16, paddingBottom: 25 },
  detailPills: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  detailCity: { color: COLORS.brandLight, fontSize: 12, fontWeight: '700' },
  detailCategory: { color: COLORS.muted, fontSize: 11, backgroundColor: COLORS.surface, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  detailTitle: { color: COLORS.text, fontSize: 21, fontWeight: '800', marginBottom: 7 },
  detailStats: { color: COLORS.muted, fontSize: 12 },
});
