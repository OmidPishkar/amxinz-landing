# Amxinz

Predict whether a real market chart goes up or down, earn points, climb the leaderboard.

Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style components, next-auth (Google), wallet-signature login (ethers), MongoDB, Binance public API, lightweight-charts.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

- **MongoDB**: `MONGODB_URI=mongodb://localhost:27017` is the default Compass URI. The `amxinz` database and its collections are created automatically.
- **Google login**: create an OAuth client in Google Cloud Console and add `http://localhost:3000/api/auth/callback/google` as a redirect URI.
- **NEXTAUTH_SECRET**: `openssl rand -base64 32`

## Routes

| URL | Logged out | Logged in |
| --- | --- | --- |
| `/` | Landing page | Chart + predict |
| `/leaderboard` | Public ranking (top 50) | Same, your row is highlighted |

## How a round works

1. `GET /api/round` picks a random symbol, interval and date since 2021 and loads 110 real candles from Binance. Only the first 100 go to the browser. Prices are rescaled to start at 100 and timestamps are fake, so the asset can't be identified.
2. `POST /api/predict` compares the choice with the stored outcome (close 10 candles ahead vs the last visible close), updates the score (+10 / −10), and only then returns the hidden candles. Rounds can be answered once.

Tune the rules in `src/lib/game.ts`. Change the coin list and timeframes in `src/lib/binance.ts`.

## Notes

- Wallet login is EVM-only (MetaMask and similar): the server issues a single-use nonce, the wallet signs it with `personal_sign`, and the server verifies the signature.
- If `api.binance.com` is geo-blocked on your host, the code falls back to `data-api.binance.vision`.
- Replace the placeholder logo in `src/components/logo.tsx`.
- Theme: light by default, toggle in the navbar (stored by next-themes).

## Ads

After every 5th prediction the player sees a full-screen ad (they can continue after 5 seconds; the next chart loads in the background meanwhile). Rules are in `src/lib/game.ts` (`AD_EVERY_PREDICTIONS`, `AD_SKIP_SECONDS`).

The source is picked with `NEXT_PUBLIC_AD_PROVIDER` in `.env.local` (restart `npm run dev` after changing it):

- `house` (default): your own sponsor creatives from `src/lib/house-ads.ts`. Sell slots directly and get paid in crypto.
- `iframe`: an ad unit from a network, embedded by URL.
- `none`: disable ads.

### A-ADS setup (publisher side, paid in Bitcoin)

1. In the A-ADS dashboard, create an **ad unit** for your site. Only the publisher flow is needed: it asks for your site URL, a size, content filters and a **Bitcoin payout address**. Never fund a campaign or enter a budget, that is the advertiser side.
2. Pick a fixed size such as 300x250.
3. Copy the iframe code. Take only the `src` value, e.g. `//acceptable.a-ads.com/1234567`.
4. In `.env.local`:
   ```
   NEXT_PUBLIC_AD_PROVIDER=iframe
   NEXT_PUBLIC_AD_IFRAME_URL=https://acceptable.a-ads.com/1234567
   NEXT_PUBLIC_AD_IFRAME_WIDTH=300
   NEXT_PUBLIC_AD_IFRAME_HEIGHT=250
   ```
5. Restart the dev server, make 5 predictions, click "Next chart".

**Verification:** A-ADS's bot only checks the exact page URL saved in the ad unit settings, and looks for the unit in that page's HTML. The landing page (`/`) has a static ad slot for this reason (the full-screen break only appears after login, so the bot can never see it). Deploy the site, make sure the ad unit's URL is the landing page (e.g. `https://www.amxinz.com`, matching your www/non-www redirect), then click "Verify embedded HTML".

If `iframe` is selected but the URL is empty or not https, the house ad is shown instead.

Google AdSense pays out by bank transfer, wire, check or PayPal Hyperwallet only (no crypto). Its full-screen format for web is the Ad Placement API (`adBreak`), which is limited to approved H5 games publishers.

## Technical SEO

Everything is driven by `src/config/site.ts` (name, description, keywords, logo, social links) and `NEXT_PUBLIC_SITE_URL`.

| Area | Where |
| --- | --- |
| Title template, description, canonical URLs, robots meta (`max-image-preview: large`), `metadataBase`, viewport/theme color | `src/app/layout.tsx`, `src/lib/seo.ts` |
| Full Open Graph + Twitter cards per page | `pageMetadata()` in `src/lib/seo.ts` |
| Generated 1200x630 share image, 48px favicon, 180px Apple icon | `src/app/opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx` |
| JSON-LD: Organization, WebSite, WebPage, WebApplication, FAQPage, BreadcrumbList | `src/lib/schema.ts`, `src/components/json-ld.tsx` |
| `sitemap.xml`, `robots.txt` (blocks `/api/`, never `/_next/`; disallows everything on non-production Netlify builds), web manifest | `src/app/sitemap.ts`, `robots.ts`, `manifest.ts` |
| Semantic HTML: one `h1` per page, landmarks, skip link, breadcrumbs, table captions and `scope`, native `<details>` FAQ | `src/components/*`, pages |
| Real 404 page (noindex) | `src/app/not-found.tsx` |
| Security and crawl headers: `X-Robots-Tag: noindex` on `/api/*`, HSTS, `nosniff`, referrer policy, no `X-Powered-By` | `next.config.mjs` |
| Performance: self-hosted font via `next/font`, fixed ad iframe size (no layout shift), lazy-loaded ad below the fold | `layout.tsx`, `ad-frame.tsx` |

Notes:
- `/` serves the landing page to logged-out visitors (which includes every crawler) and the game to logged-in users, so only the landing page needs SEO markup.
- Google only shows FAQ rich results for a small set of authoritative sites, so the FAQ markup is mainly for context and answer engines.
- Replace the placeholder logo (`icon.tsx`, `apple-icon.tsx`, `logo.tsx`) with your real one, then update `SITE.logoPath`.

## Deploy on Netlify

Netlify runs `npm run build`, which does two things `npm run dev` does not: **type-check the whole project** and **build every route**. To see exactly the errors Netlify would show, run this locally before pushing:

```bash
npm run verify     # type-check + production build
```

Build settings already in the repo: `netlify.toml` (Node 20), `.nvmrc`, `engines`, and ESLint disabled during builds (`npm run lint` still works locally).

Environment variables to add in Netlify (Site configuration -> Environment variables):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://www.amxinz.com` |
| `NEXTAUTH_URL` | `https://www.amxinz.com` |
| `NEXTAUTH_SECRET` | output of `openssl rand -base64 32` |
| `MONGODB_URI` | a **MongoDB Atlas** URI (a local Compass URI cannot be reached from Netlify) |
| `MONGODB_DB` | `amxinz` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | from Google Cloud |
| `NEXT_PUBLIC_AD_PROVIDER`, `NEXT_PUBLIC_AD_IFRAME_URL`, `NEXT_PUBLIC_AD_IFRAME_WIDTH`, `NEXT_PUBLIC_AD_IFRAME_HEIGHT` | your ad settings |

Also:
- Atlas -> Network Access: allow `0.0.0.0/0` (Netlify functions have no fixed IPs). Use a strong database password.
- Google Cloud -> add `https://www.amxinz.com/api/auth/callback/google` to the authorized redirect URIs.
- Netlify -> Domain management: set `www.amxinz.com` as the **primary domain** so the bare domain redirects to it (one canonical host).
- Variables starting with `NEXT_PUBLIC_` are baked in at build time: redeploy after changing them.

After launch: add the site in Google Search Console and Bing Webmaster Tools (paste the verification codes into the two `*_VERIFICATION` variables), then submit `https://www.amxinz.com/sitemap.xml`.
