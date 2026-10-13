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


## Round 2: account pages, billing pages and the embeddable widget (12 October 2026)
Scope added: 27 new pages (policies, sign-in and password pages, billing pages, help) and the calculator widget in `public/widget/`.

### Tests run in a real browser
| Area | Test | Result |
|---|---|---|
| Sign-in links | Script payloads placed in the `#error_description` part of the verify-email and reset-password links | Safe, shown as plain text only |
| Password pages | Forgot, reset and verify pages without sign-in keys | Show a clear message, no crash |
| Payment links | A normal `https` payment link and an insecure `http` link set in `config.js` | Only the `https` link is used |
| Widget settings | Script payloads in name, title, type, colour, calculator, WhatsApp, phone and key | Safe |
| Widget logo | `javascript:` and `http:` logo addresses | Refused |
| Widget lead form | A lead address on an unapproved host | Refused, no request sent |
| Widget builder | Quotes and tags typed into the business name | Escaped in the generated code, nothing ran |
| Help centre and onboarding | Search and saved details | Work and are safe |
| Site-wide | All 71 pages loaded; no script errors; no broken links | Pass |

### Fixed in this round
| # | Finding | Fix |
|---|---|---|
| 8 | Log in / Sign up tabs also changed the theme buttons in the menu | Tab code now only touches the sign-in form |
| 9 | Password rules differed between pages | All password pages now require at least 8 characters |

### The widget: design and risk
- The widget runs in an iframe on the customer's site. It never reads the host page.
- Every setting in the widget address is validated: colours must be 6 hex digits, phone and WhatsApp numbers digits only, logos `https` only, and lead addresses must be on an approved list (formspree.io, web3forms.com, getform.io, script.google.com, hooks.zapier.com).
- All text is added with `textContent`. Nothing from the address is written as HTML.
- Widget pages are deliberately frameable (`/widget/*` removes `X-Frame-Options` and the enforced CSP). Everything else stays protected. After deploying, check with `curl -I https://yourdomain.com/widget/index.html` that `X-Frame-Options` is absent there and still present on `/index.html`. If the widget will not load on another site, this is the first thing to check.
- A malicious person could craft a widget link that shows another business's name. The widget has no login and collects only a name and phone number, but the Acceptable Use Policy forbids misuse.

### Still needs your attention
- The account, billing and payment pages are the front end only. Real accounts need the Supabase keys, real payments need a payment link, and Pro activation is manual until you add a server.
- The Data Processing Agreement, Acceptable Use Policy and other legal pages are templates. Have a lawyer or CA read them before you rely on them, especially the 72-hour breach notice and the 30-day deletion promises, which you must be able to keep.
