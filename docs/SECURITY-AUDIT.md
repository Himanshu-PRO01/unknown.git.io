# Security audit: ToolKit Hub

Date: 12 October 2026. Scope: the static website in `public/` (43 pages, 4 scripts). Method: code review, automated scans, and live attack tests in a real browser (headless Chromium).

## Summary
No critical or high-risk problems were found. One robustness bug and several hardening gaps were found and fixed. A few risks cannot be removed in a static site and are listed under "Remaining risks".

## What was tested
| Area | Test | Result |
|---|---|---|
| Secrets | Scanned all files for tokens, private keys and service keys | Clean |
| Cross-site scripting (XSS) | Typed script payloads into every text field on the invoice, contact, login, calculator and settings pages | Safe, nothing ran |
| XSS via address bar | Payloads in `?q=` and `#hash` on the tools page | Safe |
| XSS via stored data | Poisoned values in local storage (saved profile, theme, consent, usage) | Safe |
| Dangerous code | Searched for `eval`, `document.write`, `new Function` | None found |
| Insecure links | `http://` resources and `target="_blank"` without `noopener` | None found |
| Third-party code | Listed every external script | Only AdSense, Google Analytics (after consent) and the pinned login library |
| Forms | Contact form uses `mailto:`, search form is a GET to the same site | No server-side attack surface |
| The checker itself | Planted a fake token, `eval`, an unsafe link, an unknown script and removed a header | All 5 caught |

## Problems found and fixed
| # | Finding | Risk | Fix |
|---|---|---|---|
| 1 | A corrupted saved currency in local storage crashed the invoice page | Low (page breaks, no data exposure) | Saved currency is now checked against INR, USD, EUR, GBP |
| 2 | The login library was loaded without an integrity check | Medium if the CDN were ever compromised | Added a SHA-384 integrity hash and a pinned version |
| 3 | No Content-Security-Policy | Medium (no second line of defence against XSS) | Added an enforced baseline policy plus a full report-only policy (see below) |
| 4 | No HSTS header | Low | Added `Strict-Transport-Security` |
| 5 | Address-bar hash was placed into a CSS selector | Low (could throw an error) | Hash is now limited to lowercase letters |
| 6 | Inline `onsubmit` handlers on 24 forms | Low (blocks a strict CSP later) | Replaced with a `data-nosubmit` attribute handled in `site.js` |
| 7 | Font licences were not included | Compliance | Added `assets/fonts/FONT-LICENSES.txt` |

## Added protections
- Headers on every page: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security`.
- Enforced CSP: `base-uri`, `object-src`, `frame-ancestors`, `form-action`, `upgrade-insecure-requests`.
- Report-only CSP: a full policy for scripts, styles, images, fonts, connections and frames. It blocks nothing. After AdSense is on, open the browser console, browse the site, and look for "Content Security Policy" warnings. When there are none, rename the header to `Content-Security-Policy` to enforce it.
- `scripts/security-check.py` and `.github/workflows/security.yml` run on every push, pull request and every Monday. They fail the build if a secret, an unsafe script, a missing header or an unapproved external script is found. The workflow also runs gitleaks.
- `SECURITY.md` and `.well-known/security.txt` for reporting problems.
- Dependabot keeps GitHub Actions versions up to date.

## Remaining risks (cannot be fixed in a static site)
1. **The free-use limit and the "Pro" flag live in the browser.** Visitors can clear or edit them. Real limits need accounts and a server.
2. **Local storage holds saved business details.** If any script on the site were compromised, it could read them. Keep third-party scripts to a minimum.
3. **AdSense and Analytics are third-party code** and run with the page's permissions. They load only after consent (already done).
4. **Login depends on your Supabase settings.** Set the allowed redirect URLs to your domain only, never put the `service_role` key in the site, and turn on Row Level Security before you store any data.
5. **Hosting settings were not tested.** The `_headers` file could only be checked for syntax here. After deploying, test your live address with securityheaders.com and confirm the headers appear.

## Before launch checklist
- [ ] Replace `yourdomain.com` and the placeholder email.
- [ ] Deploy with output directory `public`.
- [ ] Test the live site at securityheaders.com.
- [ ] Revoke any GitHub token that was shared in chat.
- [ ] Turn on two-step login for GitHub, Cloudflare, your domain registrar and Google.
