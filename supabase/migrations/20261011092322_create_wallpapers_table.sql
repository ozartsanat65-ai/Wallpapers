/*
# Create wallpapers table for TerraView PWA

1. New Tables
- `wallpapers`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — wallpaper title in Turkish
  - `city` (text, not null) — city name: İstanbul, Bodrum, or Van
  - `image_url` (text, not null) — URL to the wallpaper image
  - `category` (text, not null) — category label (e.g. "Şehir", "Doğa", "Sahil", "Göl")
  - `downloads` (integer, default 0) — download count
  - `likes` (integer, default 0) — like count
  - `created_at` (timestamptz, default now()) — creation timestamp

2. Security
- Enable RLS on `wallpapers`.
- Allow anon + authenticated full CRUD because this is a single-tenant public app (no sign-in).
- All data is intentionally public/shared.

3. Indexes
- Index on `city` for filtering by city.
- Index on `created_at` for ordering by newest.

4. Seed Data
- Inserts 24 wallpapers across İstanbul, Bodrum, and Van with real Pexels image URLs.
*/

CREATE TABLE IF NOT EXISTS wallpapers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  city text NOT NULL CHECK (city IN ('İstanbul', 'Bodrum', 'Van')),
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'Genel',
  downloads integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_wallpapers" ON wallpapers;
CREATE POLICY "anon_select_wallpapers" ON wallpapers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wallpapers" ON wallpapers;
CREATE POLICY "anon_insert_wallpapers" ON wallpapers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_wallpapers" ON wallpapers;
CREATE POLICY "anon_update_wallpapers" ON wallpapers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_wallpapers" ON wallpapers;
CREATE POLICY "anon_delete_wallpapers" ON wallpapers FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_wallpapers_city ON wallpapers(city);
CREATE INDEX IF NOT EXISTS idx_wallpapers_created_at ON wallpapers(created_at DESC);

INSERT INTO wallpapers (title, city, image_url, category, downloads, likes) VALUES
-- İstanbul
('Galata Kulesi Gün Batımı', 'İstanbul', 'https://images.pexels.com/photos/20577444/pexels-photo-20577444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 1240, 320),
('Modern İstanbul Silüeti', 'İstanbul', 'https://images.pexels.com/photos/24022445/pexels-photo-24022445.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 890, 210),
('Boğaz Manzarası', 'İstanbul', 'https://images.pexels.com/photos/39475255/pexels-photo-39475255.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 2100, 540),
('Galata ve Boğaz', 'İstanbul', 'https://images.pexels.com/photos/31916216/pexels-photo-31916216.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 1560, 410),
('Şehir ve Nehir', 'İstanbul', 'https://images.pexels.com/photos/18309711/pexels-photo-18309711.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 720, 180),
('Boğaz Köprüsü', 'İstanbul', 'https://images.pexels.com/photos/14187552/pexels-photo-14187552.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 3200, 890),
('Panoramik İstanbul', 'İstanbul', 'https://images.pexels.com/photos/28764621/pexels-photo-28764621.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 1100, 290),
('Ortaköy Camii', 'İstanbul', 'https://images.pexels.com/photos/14615940/pexels-photo-14615940.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Şehir', 1850, 460),
-- Bodrum
('Bodrum Sahil Evleri', 'Bodrum', 'https://images.pexels.com/photos/37530203/pexels-photo-37530203.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 1400, 380),
('Plaj ve Şemsiyeler', 'Bodrum', 'https://images.pexels.com/photos/31943678/pexels-photo-31943678.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 980, 250),
('Bodrum Kuş Bakışı', 'Bodrum', 'https://images.pexels.com/photos/39328099/pexels-photo-39328099.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 2600, 670),
('Yaz Plajı', 'Bodrum', 'https://images.pexels.com/photos/39117760/pexels-photo-39117760.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 1750, 430),
('Marina ve Yatlar', 'Bodrum', 'https://images.pexels.com/photos/33947545/pexels-photo-33947545.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 1300, 340),
('Bodrum Limanı', 'Bodrum', 'https://images.pexels.com/photos/37530202/pexels-photo-37530202.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 1120, 300),
('Sahil Yolu', 'Bodrum', 'https://images.pexels.com/photos/31709884/pexels-photo-31709884.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Doğa', 840, 220),
('Tepe ve Deniz', 'Bodrum', 'https://images.pexels.com/photos/19061178/pexels-photo-19061178.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Sahil', 960, 260),
-- Van
('Van Gölü ve Dağlar', 'Van', 'https://images.pexels.com/photos/37365340/pexels-photo-37365340.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Göl', 1500, 390),
('Van Gölü Marina', 'Van', 'https://images.pexels.com/photos/19944693/pexels-photo-19944693.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Göl', 780, 200),
('Bitlis Dağ Manzarası', 'Van', 'https://images.pexels.com/photos/31236144/pexels-photo-31236144.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Dağ', 1100, 280),
('Karlı Dağlar ve Göl', 'Van', 'https://images.pexels.com/photos/27065007/pexels-photo-27065007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Dağ', 2200, 550),
('Van İskele Sabahı', 'Van', 'https://images.pexels.com/photos/37081244/pexels-photo-37081244.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Göl', 1340, 350),
('Van Gölü Tekne', 'Van', 'https://images.pexels.com/photos/8340227/pexels-photo-8340227.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Göl', 890, 230),
('Martılar ve Göl', 'Van', 'https://images.pexels.com/photos/18103585/pexels-photo-18103585.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Doğa', 650, 170),
('Sessiz Dağ Manzarası', 'Van', 'https://images.pexels.com/photos/37365334/pexels-photo-37365334.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Dağ', 1020, 270)
ON CONFLICT DO NOTHING;