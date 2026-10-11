# ToolKit Hub

Free online tools for work and money: a GST invoice generator, loan, SIP, FD and PPF calculators, income tax and GST calculators, and guides. It is a static site (plain HTML, CSS and JavaScript), so any static host works.

## Set up
1. Open `assets/config.js` and fill in your email. Add your AdSense publisher ID (`ca-pub-...`) when you have it, and your Supabase URL and anon key for login.
2. Replace `yourdomain.com` in `sitemap.xml` and `robots.txt` with your real domain.
3. Replace the placeholder line in `ads.txt` after AdSense approves your site.

## Deploy
Upload this folder to Cloudflare Pages, Netlify or GitHub Pages and connect your domain.

## Updating tax slabs
Edit the `TAX` block at the top of `assets/tools.js` when the rules change.
