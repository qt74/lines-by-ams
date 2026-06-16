# Mariam Couture design images

Save the gown images here with these EXACT filenames. The Mariam Couture
shop (seeded in `server/seed.js`) points at these paths:

| File to save here          | Which sketch (from the couture set)                         |
|----------------------------|-------------------------------------------------------------|
| `couture-1.png`            | Silver / pearl beaded off-shoulder mermaid gown             |
| `couture-2.png`            | Gold fan-beaded bodice + pleated champagne skirt (= cover)  |
| `couture-3.png`            | Champagne sweetheart bodice with high front slit            |
| `couture-4.png`            | Gold lattice gown with ruby-toned gemstone accents          |

Notes:
- Filenames are case-sensitive. Use lowercase `.png` (or change the
  extensions in `server/seed.js` if you save as `.jpg`).
- These live under `client/public/`, so the app serves them at
  `/designs/couture-1.png` etc. — in dev (Vite) and in production (Vercel).
- After saving the files, restart the backend so the seed re-runs, then
  open the Mariam Couture shop to see them.
