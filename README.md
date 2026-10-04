# ndeavour

Website for N-Deavour Alignment (https://ndeavour.ca).

## How it works

Static site, hosted on Netlify. Everything that gets published lives in `public/`; `netlify.toml` points Netlify at that folder, and there is no build step. Merging to `main` publishes the site, usually within a minute or two. Every pull request gets a Netlify preview link. Changes are merged only when the owner says so.

- `public/index.html`: the home page. Sections: hero, why now, services, The Alignment Method™, pilot, experience strip, About, contact.
- `public/style.css`: all styling. Colours and spacing are variables at the top of the file.
- `public/site.js`: contact form checks and sending, the header edge on scroll, scroll fade-ins, and the "Pause animations" control. Nothing on the page depends on it.
- `public/privacy.html`, `terms.html`, `cookies.html`: legal pages (drafts awaiting the owner's review).
- `public/_headers`: security headers, including a strict Content Security Policy.

The contact form uses Netlify Forms (see the `inquiry` form in `public/index.html`).

## Rules for changes

- **Brand:** use only the brand palette and DM Sans, and follow the Brand Identity & Voice Guidelines (version 1.1, section 15 covers the website). Gradients stay within brand colours.
- **Honesty:** no invented testimonials, metrics or clients. Figures are sourced on the page or labelled as past-project results.
- **Security and privacy:** no inline scripts or styles (the Content Security Policy blocks them), no third-party scripts, no analytics or tracking, and self-hosted fonts only. Set styles from JavaScript with `style.setProperty` or by toggling classes.
- **Accessibility:** aim for WCAG 2.2 level AA. Check small text for contrast (Dusk Violet is for large text only), keep every control keyboard-reachable with a visible focus outline, and keep the page free of horizontal scrolling at 320 px wide.
- **Motion:** every animation must stop under `prefers-reduced-motion` and under the footer "Pause animations" control. Hover effects belong inside `@media (hover: hover)`.
- **Prices and claims:** if a price, pilot term or credential changes, update the page, the service documents and the brand guidelines together.

## Checking a change

Serve `public/` locally, then check at 1280, 800 and 390 px wide: no console errors, no outside requests, no horizontal scroll, and the contact form still validates and submits. An axe-core scan (WCAG 2.2 A and AA plus best practices) should report no violations on all four pages.
