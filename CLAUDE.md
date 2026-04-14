# Taverna del Porto — Project Conventions

## Stack
- Astro 5, Tailwind CSS v4 (Vite plugin), no JS frameworks
- Zero JavaScript frameworks — only Astro components + vanilla JS for interactions

## Components
- One `.astro` file per component in `src/components/<domain>/`
- Props typed with `Astro.props` interface pattern
- Components are reusable — accept content via props, never hardcode text

## Content
- All variable content (restaurant name, phone, menu, hours) in `src/data/*.json`
- Pages and components read from JSON — never hardcode text in components
- To adapt for a new client: change JSON files + color tokens in global.css

## Styles
- Tailwind utility classes for layout and spacing
- Colors via CSS custom properties defined in `@theme` block in `src/styles/global.css`
- Font: Playfair Display (headings), Lato (body)
- Animations: CSS scroll-driven (`animation-timeline: view()`) with `@supports` progressive enhancement

## Language
- Italian for user-facing content
- English for code (variable names, comments, commit messages)

## SEO
- Every page: unique title, description, og tags
- JSON-LD Restaurant schema on home, Menu schema on menu page
- Sitemap via @astrojs/sitemap
- `<html lang="it">`

## Performance
- Target: PageSpeed > 90 mobile
- JS budget: < 10KB total (hamburger + lightbox + form + navbar scroll)
- Images: lazy loading, defined aspect ratios
- Fonts: preload critical weights, font-display: swap

## Deploy
- Vercel, output: static
- Site URL: https://taverna-del-porto.vercel.app
