# ToolKit Hub

Free online tools for work and money: a GST invoice generator, loan, SIP, FD and PPF calculators, income tax and GST calculators, and guides. It is a static site (plain HTML, CSS and JavaScript).

## Folders
- `public/` is the website. Deploy this folder.
- `scripts/security-check.py` runs automatic security checks.
- `.github/workflows/security.yml` runs those checks on every push and every Monday.
- `docs/SECURITY-AUDIT.md` is the latest security audit.

## What is in the site
- Tools, calculators and guides.
- Policies (privacy, terms, cookies, refund, cancellation, returns, accessibility, data processing, acceptable use, security, responsible disclosure, community guidelines) linked from `legal.html`.
- Account and billing pages (log in, register, verify email, forgot and reset password, onboarding, account, billing, upgrade, downgrade, cancel, payment success, failed and pending), a help center and support page.
- An embeddable calculator widget for businesses (`public/widget/`, builder at `widget-builder.html`).

## Deploy (Cloudflare Pages)
Connect this repo, set **Build command** to empty and **Build output directory** to `public`. Only the `public` folder is published, so scripts, workflows and docs stay private.

## Before launch
1. Edit `public/assets/config.js`: your email and WhatsApp number, then AdSense, Supabase and payment links when you have them.
2. Replace `yourdomain.com` in `public/sitemap.xml`, `public/robots.txt`, `public/.well-known/security.txt` and `SECURITY.md`.
3. Run `python3 scripts/security-check.py public` and fix any FAIL lines.

## Updating tax slabs
Edit the `TAX` block at the top of `public/assets/tools.js` when the rules change.
