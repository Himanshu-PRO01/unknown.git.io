# Security policy

## Reporting a problem
If you find a security problem in ToolKit Hub, please email **hello@yourdomain.com** with the details and steps to reproduce it. Please do not open a public issue for security problems. We aim to reply within 3 working days.

## What is in scope
- The website code in `public/`.
- Anything that could expose a visitor's data or let a script run on the site.

## Good to know
- The tools run in the visitor's browser. Invoice and calculator data is not sent to a server.
- Saved business details are stored only in the visitor's own browser (local storage).
- The free-use limit is checked in the browser, so it is not a security boundary. Real limits and payments need a server.
