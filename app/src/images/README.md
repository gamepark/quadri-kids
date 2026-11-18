# Images

All images are **lossless WebP**, opaque, at **100 px per cm** of the physical item.

Publisher source files: `Quadri Kids appli Mobile/sources/quadri-kids/` (outside this repo).

## Layout

```
tiles/                 Color tiles, 35 mm -> 350 x 350 px
  yellow-dog.webp        <- PNG - bga/1-Chien.png
  magenta-rabbit.webp    <- PNG - bga/2-Lapin.png
  black-cat.webp         <- PNG - bga/3-Chat.png
  cyan-bear.webp         <- PNG - bga/4-Ours.png
cards/objectives/      Objective cards, 60 mm -> 600 x 600 px
  1.webp … 42.webp       <- 2026-6-18-cartes_objectif__QuadriKids.pdf, page 2n (TrimBox)
  back.webp              <- same PDF, page 1 (TrimBox)
```

## Recipe

- **Tiles**: the "PNG - bga" files (500 px, 4 Nov 2026) are resized to 350 px with Lanczos.
  The print file `Tuiles35mm-84x84mm-contour.pdf` has an older illustration (white outline around
  the animals): the publisher chose the "bga" version.
- **Objective cards**: rendered from the vector print PDF with MuPDF, at a scale where the TrimBox
  (60 mm) is 600 px, then cropped to the TrimBox. Card `n` is page `2n` of the PDF, so it is
  `PNG - bga/carte-quadri_<2n>.png` (the numbering used in the mobile app's `docs/ASSETS.md` and
  `objectives.ts`). The 41 existing PNGs match the renders (mean difference ≤ 1/255);
  `carte-quadri_34.png` is missing, so card 17 exists only in the PDF.
- **Card back**: every odd page of the PDF is the same back, with the logo shifted by a few pixels for
  printing; page 1 is used.
- Encoding: `sharp(...).webp({ lossless: true, effort: 6 })`.

## Platform images (`app/public/`)

These are presentation images, not game material: lossy compression is fine.

- `box-640.png` / `.webp`: `philibert/quadri-kids-box-3d.jpg`, white background removed by a flood
  fill from the border (pixels with min(R,G,B) ≥ 238), alpha edge blurred 1 px and tightened, trimmed,
  then fitted in 640 × 640 transparent. PNG with a 256-colour palette, WebP quality 90.
- `cover-1920.jpg` / `.webp`: composed: tilted grid (-14°) of pastel squares like the box, the HD logo
  `Titre.png` (980 px wide) and the 4 tiles (250 px, slightly rotated, soft `#1A1107` shadow).
  Quality 85.
- `avatar-320/96/64.png`, `favicon-96x96.png`, `favicon.ico` (16/32/48) and `favicon.svg`: the mobile
  app's icon `mobile/assets/icons/kids/icon.png` (HD logo on white, 1024 px), resized.
