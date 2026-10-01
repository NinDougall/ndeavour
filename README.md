# ndeavour
website

## ndeavour.ca

Static site, hosted on Netlify. Everything that gets published lives in `public/`; `netlify.toml` points Netlify at that folder, and there is no build step. Merging to `main` publishes the site.

The contact form uses Netlify Forms (see the `inquiry` form in `public/index.html`). Security headers are in `public/_headers`.
