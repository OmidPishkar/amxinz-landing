# Amxinz — Trading Practice Arena

Amxinz is an educational trading practice product built around historical market scenarios. Users make decisions while future candles are hidden, then review the outcome and build evidence about their trading skills.

## Stack
Next.js 15 App Router, TypeScript, React, Tailwind CSS, Radix UI, NextAuth, ethers, MongoDB, Binance historical market data and lightweight-charts.

## Local development
```bash
npm install
cp .env.example .env.local
npm run dev
```
The application uses the MongoDB database named `amxinz-landing`. Set `MONGODB_URI` to a local MongoDB instance for development and MongoDB Atlas in production.

## Product areas
- Main Game: historical candlestick Up/Down practice, score and prediction history.
- Daily Mission: five shared historical scenarios per UTC day, identical for all participants.
- Skill Assessment: evidence-based ratings for trend, structure, levels, breakouts, reversals, momentum and risk management.
- Personal Missions: adaptive unused scenarios selected from demonstrated weak skills.
- Risk Lab: Long/Short simulation with stop-loss and take-profit planning.
- XP, Levels and Daily Streaks: separate from the legacy Main Game score.
- Challenges, leaderboard, public/private profiles, badges, profile exports and Weblog CMS.
- Weekly Reports for Pro and Elite subscribers.

## Plans and billing
Plans are priced in USD and paid in USDT (BEP-20) on BNB Smart Chain (chain ID 56). The payment flow creates a locked invoice, verifies the token transfer event, checks sender, recipient, token contract, amount and chain, and waits for 60 confirmations before activating a subscription.
The configured token contract is the Binance-Peg BSC-USD / USDT BEP-20 contract. The application verifies its on-chain name, symbol and 18 decimals before creating or verifying an invoice. The receiver address is configured in `src/lib/payment.ts`.
A compatible wallet and BNB for network gas are required to pay. Amxinz never requests or stores private keys or seed phrases. Prepaid plans do not auto-renew. A 14-day full-feature trial is available once per account after email verification.

## Advertising
A-ADS is the only advertising provider. Guest, Free and expired accounts may see A-ADS placements when advertising is enabled. Active paid subscriptions and active trials suppress site-wide and in-game placements, including the iframe request.
Set `NEXT_PUBLIC_ADS_ENABLED=true`, `NEXT_PUBLIC_AD_IFRAME_URL` to the exact URL supplied by your A-ADS unit, and configure width and height. Keep the master switch false in local development if you do not want ads.

## Environment
Important variables: `NEXT_PUBLIC_SITE_URL`, `MONGODB_URI`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Google OAuth credentials, `RESEND_API_KEY`, `EMAIL_FROM`, `UPLOADTHING_TOKEN`, `ADMIN_EMAILS`, `BSC_RPC_URL`, `NEXT_PUBLIC_ADS_ENABLED` and `NEXT_PUBLIC_AD_IFRAME_URL`.
The default admin email is `omidjr17@gmail.com`; it must be verified on the account. Admin access is checked server-side.

## SEO and deployment
Public pages include the landing page, pricing, documents, about, FAQ, privacy policy, Weblog, leaderboard, challenges and explicitly public user profiles. Private practice, account, checkout and admin routes are excluded from indexing. The sitemap includes only profiles whose owners have enabled public visibility.
Netlify automatically builds and deploys after a commit to `main`. Configure production environment variables and ensure the production MongoDB URI points to the existing `amxinz-landing` database. Do not change the database name.
Before enabling real payments, verify the receiver and token contract, confirm the RPC is connected to BNB Smart Chain, and perform a small end-to-end payment test. Never put a wallet private key or seed phrase in environment variables.
