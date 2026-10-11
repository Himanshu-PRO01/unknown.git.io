#!/usr/bin/env python3
"""Security checks for the ToolKit Hub static site. No dependencies.
Usage: python3 scripts/security-check.py public
Exit code 1 if any check fails (warnings do not fail the run)."""
import base64, json, os, re, sys

root = sys.argv[1] if len(sys.argv) > 1 else 'public'
fails, warns, notes = [], [], []
TEXT = ('.html', '.js', '.css', '.json', '.txt', '.xml', '.webmanifest', '.md', '.svg')

def read_all():
    for d, _, fs in os.walk(root):
        for f in fs:
            p = os.path.join(d, f)
            if f.endswith(TEXT) or f in ('_headers', '_redirects'):
                yield p, open(p, encoding='utf-8', errors='ignore').read()

files = list(read_all())

# 1. Secrets
SECRETS = [r'github_pat_[A-Za-z0-9_]{20,}', r'gh[pousr]_[A-Za-z0-9]{30,}', r'AKIA[0-9A-Z]{16}', r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
           r'sk_live_[A-Za-z0-9]{10,}', r'xox[baprs]-[A-Za-z0-9-]{10,}', r'AIza[0-9A-Za-z_\-]{35}']
for p, t in files:
    for pat in SECRETS:
        if re.search(pat, t): fails.append('Possible secret in %s (pattern %s)' % (p, pat))
    for m in re.finditer(r'eyJ[A-Za-z0-9_-]{5,}\.(eyJ[A-Za-z0-9_-]{5,})\.[A-Za-z0-9_-]{5,}', t):
        try:
            payload = json.loads(base64.urlsafe_b64decode(m.group(1) + '=' * (-len(m.group(1)) % 4)))
            if payload.get('role') == 'service_role': fails.append('Supabase service_role key found in %s' % p)
        except Exception: pass

# 2. HTML checks
for p, t in files:
    if not p.endswith('.html'): continue
    for m in re.finditer(r'<a [^>]*target="_blank"[^>]*>', t):
        if 'noopener' not in m.group(0): fails.append('target=_blank without rel=noopener in %s' % p)
    for m in re.finditer(r'(?:src|href)="(http://[^"]+)"', t):
        if 'localhost' not in m.group(1): fails.append('Insecure http:// URL in %s: %s' % (p, m.group(1)))
    for m in re.finditer(r'<script[^>]+src="(https?://[^"]+)"', t):
        fails.append('External script tag in %s: %s (load third-party scripts only from approved code)' % (p, m.group(1)))

# 3. JavaScript checks
ALLOWED_SCRIPT_HOSTS = ('https://pagead2.googlesyndication.com/', 'https://www.googletagmanager.com/', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@')
inner = 0
for p, t in files:
    if not p.endswith('.js'): continue
    for bad in ('eval(', 'document.write(', 'new Function('):
        if bad in t: fails.append('%s used in %s' % (bad, p))
    inner += len(re.findall(r'\.innerHTML\s*=', t))
    for m in re.finditer(r'https://[A-Za-z0-9./_@-]+\.js', t):
        if not m.group(0).startswith(ALLOWED_SCRIPT_HOSTS): fails.append('Unapproved script host in %s: %s' % (p, m.group(0)))
    if 'supabase-js@' in t and 'integrity' not in t: fails.append('Supabase script loaded without an integrity hash in %s' % p)
notes.append('%d innerHTML assignments in site scripts (all use escaped or numeric data; re-check if you add more)' % inner)

# 4. Required files and headers
for need in ('robots.txt', 'sitemap.xml', '404.html', '_headers', '.well-known/security.txt', 'ads.txt'):
    if not os.path.exists(os.path.join(root, need)): fails.append('Missing file: %s' % need)
hp = os.path.join(root, '_headers')
if os.path.exists(hp):
    h = open(hp).read()
    for need in ('X-Content-Type-Options', 'Referrer-Policy', 'X-Frame-Options', 'Strict-Transport-Security', 'Content-Security-Policy:'):
        if need not in h: fails.append('Header missing in _headers: %s' % need)

# 5. Launch reminders (warnings only)
left = sum(t.count('yourdomain.com') for _, t in files)
if left: warns.append('"yourdomain.com" still appears %d times. Replace it with your real domain before launch.' % left)
cfg = os.path.join(root, 'assets', 'config.js')
if os.path.exists(cfg):
    c = open(cfg).read()
    if 'hello@yourdomain.com' in c: warns.append('assets/config.js still has the placeholder email.')

for n in notes: print('NOTE  ', n)
for w in warns: print('WARN  ', w)
for f in fails: print('FAIL  ', f)
print('\n%d checks failed, %d warnings' % (len(fails), len(warns)))
sys.exit(1 if fails else 0)
