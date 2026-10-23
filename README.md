# Hoeurn Dareach — Portfolio

Personal portfolio built from the Figma file **Portfolio** (`uZPlqppcPMVsnXD6hx4g3b`, Prototype page).
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · English / ខ្មែរ.

## Commands

| | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run tokens` | Regenerate `src/styles/tokens.css` + `theme.css` from `design/tokens.json` |

## Design tokens

`design/tokens.json` is a copy of the Figma variables (colors Light/Dark, spacing, radius, type, motion,
responsive modes). Tailwind utilities use the Figma token names, and numbers are pixels:

- `bg-page`, `bg-surface-primary`, `text-secondary`, `text-icon-general-primary`, `border-general-default`
- `p-24`, `gap-12`, `w-248`, `rounded-shell`, `shadow-card`
- Text styles: `type-body`, `type-label`, `type-page-title`, … (Khmer pages switch to the Khmer ramp automatically)
- Breakpoints: `tablet:` ≥ 768, `desktop:` ≥ 1280, and `rail:` for the 72px icon sidebar

## Structure

- `src/app/[lang]/` — routes (`/en`, `/km`); Developer is the home page
- `src/components/shell/` — sidebar, top bar, mobile menu, theme toggle, ⌘K search
- `src/components/icons.tsx` — icons exported from Figma
- `src/i18n/` — interface strings (Khmer from the Figma "Interface language" collection)
- `src/lib/search-index.ts` — what global search can find (real content only)
# Portfolio
