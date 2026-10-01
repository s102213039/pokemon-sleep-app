# Original User Request

## Initial Request — 2026-07-31T00:19:28+08:00

Build a modern, high-performance, single-page web application (SPA) for Pokémon Sleep data (247+ Pokemons), featuring real-time search, type & specialty multi-filtering, card/table view toggle, rich dark-theme aesthetic, and deploy it to a public GitHub Pages repository (`pokemon-sleep-app`).

Working directory: c:\Users\chiu\.gemini\antigravity\scratch\pokemon_sleep_webapp
Integrity mode: development

## Requirements

### R1. Web Application Core (SPA)
Build a responsive HTML/JS/CSS Single Page Application that embeds and presents the complete Pokémon Sleep dataset (247+ Pokemons). Include instant text search (by CN/EN/JP name & ID), filter tags for Types (草, 火, 水, 龍, etc.) and Specialties (樹果, 食材, 技能), sorting options (Carry capacity, Ingredient rate, Interval), and full ingredient breakdowns with icon fallbacks.

### R2. Design System & Aesthetics
Implement a sleek dark-themed design system using Vanilla CSS custom properties, responsive grid layout for mobile and desktop, interactive hover effects, smooth transitions, and type-specific badge styling.

### R3. GitHub Repository & GitHub Pages Setup
Initialize a local Git repository in the working directory, structure all assets cleanly (index.html, styles.css, app.js, data.json), configure GitHub deployment files / instructions, commit the project, and prepare remote pushing to `pokemon-sleep-app` on GitHub for GitHub Pages hosting.

## Acceptance Criteria

### Web Application & UI
- [ ] Instant search filtering by name or number updates UI in real-time without page reload.
- [ ] Multi-select filtering for Types and Specialties renders smooth visual feedback.
- [ ] View mode toggle between Grid Cards and Detailed Table View works seamlessly.
- [ ] Complete data coverage of all 247+ Pokemons with accurate stats, icons, ingredient quantities, and rates.

### Repository & Deployment
- [ ] Git repository initialized with clean commit history.
- [ ] Automated GitHub Pages deployment structure (`index.html` at root, ready for GitHub Pages publishing).
