# kocadassahlee — Roblox profile site

A single-page, static profile site for the Roblox account
[kocadassahlee](https://www.roblox.com/users/8276312071/profile) (user ID `8276312071`).

No build step, no dependencies. Open `index.html` and it works.

## Run it

```bash
python -m http.server 4321        # then visit http://127.0.0.1:4321
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

## What's inside

| File | Purpose |
| --- | --- |
| `index.html` | All content and markup |
| `styles.css` | Design tokens, layout, animations |
| `script.js` | Theme, reveals, counters, tilt, copy-to-clipboard |
| `assets/avatar.png` | Full-body avatar, downloaded from Roblox |
| `assets/headshot.png` | Headshot used in the profile card |
| `assets/favicon.svg` | Favicon |

## Updating the content

- **Name / bio / links** — edit `index.html`. The links section points at the
  real profile and friends list, plus Roblox Discover and the Avatar Shop.
- **Stats** — the Friends / Followers / Following numbers are the ones on the
  profile when the page was built. Update the `data-count` attributes in
  `index.html` if they change.
- **Days on Roblox** — computed automatically in `script.js` from the account's
  creation date (`PROFILE.created`). No manual updates needed.
- **Joined date** — `April 7, 2025`, in three places in `index.html`.
- **Colours** — every colour is a CSS variable at the top of `styles.css`,
  with separate values for the dark and light themes.

## Publish on GitHub Pages (free)

GitHub Pages is free for public repositories. Everything in this folder is
static and all paths are relative, so it works at either of these URLs:

- repo named `<your-username>.github.io` → `https://<your-username>.github.io/`
- any other repo name, e.g. `roblox-profile` → `https://<your-username>.github.io/roblox-profile/`

### Option A — upload in the browser (no Git needed)

1. On GitHub, create a new **public** repository. Don't add a README or
   `.gitignore` (this folder already has them).
2. **Add file → Upload files**, then drag in `index.html`, `styles.css`,
   `script.js`, `README.md`, `.gitignore`, and the whole `assets` folder.
3. Commit.
4. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*,
   Branch = `main`, folder = `/ (root)`. Save.
5. Wait a minute; the URL appears on that settings page.

> `.nojekyll` and `.gitignore` are dotfiles and may be skipped by drag-and-drop.
> That's fine — `.nojekyll` is optional here. To add it by hand: **Add file →
> Create new file**, name it `.nojekyll`, leave it empty, commit.

### Option B — Git in the terminal

```bash
git init -b main
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git commit -m "Add kocadassahlee Roblox profile page"
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

Then use the same **Settings → Pages** step as above.

Pages serves over HTTPS automatically; turn on **Enforce HTTPS** in the Pages
settings once the certificate is ready.

## Notes

- Light/dark theme follows the OS on first visit, then remembers the choice.
- All motion is disabled automatically under `prefers-reduced-motion`.
- Also deployable on Cloudflare Pages, Netlify, Vercel, or any static host.
- The page is public and search-engine indexable. Add `robots.txt` with
  `Disallow: /` if you'd rather it stayed unlisted.
