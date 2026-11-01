# Project memory

## Product intent & audience

- **TerraView**: Turkish-language wallpaper app
- Core features: Keşfet (Explore), Kategoriler (Categories), Favoriler (Favorites), Yönetim (Admin Panel)
- Search, city filters, wallpaper detail modal
- Wallpapers stored in database; favorites stored locally on device
- Target audience: Turkish-speaking users

## Brand personality & voice

- Turkish UI language throughout
- App name "TerraView" implies earth/nature/landscape visual themes

## Visual design & UX direction

- Tab-based navigation (4 main tabs)
- Search and city filters on main screen
- Image detail modal/viewer pattern
- See `.bolt/prompt` for general aesthetic directives

## Decisions, constraints & rationale

- Framework: Expo (mobile), though Vite/web template also detected — platform ambiguity unresolved
- Tech: JSX + Tailwind CSS, React hooks, Lucide React icons, `@/` path alias → `src/`
- No additional UI packages unless explicitly requested (per `.bolt/prompt`)
- Main screen is a single very large file — maintainability concern noted

## Open questions & assumptions

- **Platform ambiguity**: Expo (mobile) vs Vite (web) — needs clarification before major work
- **Admin Panel has no auth**: anyone can add/delete wallpapers — security concern, no decision yet
- **No prior task memory**: user said "kaldığın yerden devam et" (continue from where you left off) but no previous work was recorded
- User has not yet specified which task to proceed with; options presented: add admin auth, split main screen, or new feature