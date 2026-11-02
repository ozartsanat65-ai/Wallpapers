# Project memory

## Product intent & audience

- **TerraView** is a Turkish-language Expo wallpaper app focused on discovering and viewing earth, nature, city, and landscape imagery.
- Main areas: **Keşfet**, **Kategoriler**, **Favoriler**, and **Yönetim**.
- Existing product flows include search, city-based filtering, wallpaper detail viewing, database-backed wallpapers, and locally stored favorites.
- Primary audience is Turkish-speaking mobile users.

## Brand personality & voice

- UI and user-facing content should remain in Turkish.
- Product identity is associated with natural, geographic, and landscape imagery.
- Tone should feel polished, practical, and visually premium rather than generic.

## Visual design & UX direction

- Use a mobile-first tab/navigation structure for the four primary areas.
- Keep discovery efficient with prominent search, category/city filters, and image-focused browsing.
- Wallpaper details use a focused viewer/modal-style experience with clear actions such as favorite and close/back.
- Favor visual hierarchy that gives imagery priority while keeping controls discoverable and touch-friendly.
- Preserve responsive behavior across common Expo mobile screen sizes and maintain accessible contrast and readable Turkish labels.
- Prefer existing project conventions and lightweight reusable components over introducing a new UI system.

## Decisions, constraints & rationale

- Platform is **Expo/React Native**; the earlier web-template ambiguity is resolved.
- The dependency installation issue was fixed by aligning `react-dom` with the project’s React version at **19.2.3** and regenerating the lockfile.
- `npm ci`, type checking, and Expo validation checks passed after the dependency correction.
- Android build verification was not available in the current environment; a real Android build/restart remains the final external verification step.
- Current implementation uses JSX, hooks, Tailwind-compatible styling conventions, Lucide icons, and the `@/` alias mapped to `src/`; maintain these project conventions.
- Avoid adding UI/icon dependencies unless needed for a concrete feature.
- The main screen is currently very large; future changes should avoid increasing its coupling and should extract reusable sections when practical.
- The admin area currently lacks authentication, so wallpaper mutation actions may be publicly accessible; treat this as a security issue before production release.
- Wallpapers are database-backed while favorites are device-local, so changes should preserve that separation.

## Open questions & assumptions

- Confirm whether the Android build succeeds in the target CI/device environment after the lockfile fix.
- Determine the intended authentication and authorization model for the Yönetim area.
- Decide whether and when to split the large main-screen implementation into focused components.
- No specific follow-up feature or bug beyond the dependency/build issue has been selected yet.