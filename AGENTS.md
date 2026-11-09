<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the shared GenreSelect and uploadGenres/isUploadGenre catalogue helpers for music and video forms, so saved selections match public genre filters exactly.
- Keep theme colours, glass surfaces, and gradients centralized in src/styles.css and expose actions through shared Button variants so presentation stays consistent across public pages.
- R2 and Pesapal credentials live as server-only defaults in src/lib/app-credentials.server.ts (env *_OVERRIDE wins); remixes must work with no secrets to fill in.
- Open tabs auto-update: vite.config defines a per-build __APP_BUILD_ID__, /api/public/version returns it, and AutoUpdater (mounted in __root) reloads on mismatch — at a song boundary if media is playing, forced after a short wait cap, and never reloading twice in a row; keep this so users never stay on stale versions.
- App install is manifest-only (public/manifest.webmanifest + public/icons); every install button uses the shared useInstallApp hook (native browser prompt, iPhone share sheet) and no app-shell service worker is registered.
- Operational admin click records use the existing Firebase userActivities collection, with allowlisted non-sensitive fields and admin-only read/delete rules; this is separate from Lovable analytics so records can be reviewed and cleared inside the app.
- Keep click labels and target types synchronized with firestore.rules; wait for Firebase authentication restoration before writing and expose write failures in the admin activity view so missing records are diagnosable.
- Admin layouts collapse navigation on phones and activity rows use compact mobile records instead of a six-column table, keeping narrow screens readable.
- Video browse filters normalize legacy saved genre spellings through videoGenres while keeping uploads on the shared catalogue; URL genre selection is authoritative so sidebar and detail links retain the filter.
