# ToolKit Hub

Free online tools for work and money: a GST invoice generator, loan, SIP, FD and PPF calculators, income tax and GST calculators, and guides. It is a static site (plain HTML, CSS and JavaScript).

## Folders
- `public/` is the website. Deploy this folder.
- `scripts/security-check.py` runs automatic security checks.
- `.github/workflows/security.yml` runs those checks on every push and every Monday.
- `docs/SECURITY-AUDIT.md` is the latest security audit.

## Deploy (Cloudflare Pages)
Connect this repo, set **Build command** to empty and **Build output directory** to `public`. Only the `public` folder is published, so scripts, workflows and docs stay private.

## Before launch
1. Edit `public/assets/config.js`: your email, then AdSense and Supabase details when you have them.
2. Replace `yourdomain.com` in `public/sitemap.xml`, `public/robots.txt`, `public/.well-known/security.txt` and `SECURITY.md`.
3. Run `python3 scripts/security-check.py public` and fix any FAIL lines.

## Updating tax slabs
Edit the `TAX` block at the top of `public/assets/tools.js` when the rules change.
