# Gallery preview media

Drop files in, run `pnpm registry:build`, done. Nothing to wire up by hand —
the build scans these folders and fills each entry's `media` field.

## Where files go

`components/` for a component, `blocks/` for a block — matching the entry's
`type`. The build looks in the folder for that type first and falls back to
this one, so a loose file still works.

## Naming

The filename must carry the **entry name** (`sliding-tabs`, `flip-card` …),
because every entry of a type shares one folder. Any of these layouts work:

```
components/sliding-tabs-poster.webp   components/sliding-tabs-preview.mp4
components/sliding-tabs.webp          components/sliding-tabs.mp4
components/sliding-tabs/poster.webp   components/sliding-tabs/preview.mp4
```

Poster only = a static card. Neither = "Preview coming soon". An entry that
sets `media` by hand in `registry-ui.ts` / `registry-blocks.ts` overrides
whatever is found here.

Accepted: `.webp .avif .png .jpg .jpeg` for the poster, `.mp4 .webm .gif` for
the clip. Earlier in that list wins, so a `.webp` beats a `.png` for the same
entry, and an `.mp4` beats a `.gif`.

## Specs

| | |
| --- | --- |
| Aspect | **16:10** — the card crops to it with `object-cover` |
| Poster | 1280x800 webp, under ~120 KB |
| Video | 1280x800 **mp4 (H.264, yuv420p)**, 3-6s, seamless loop, **no audio track** |
| Video size | Aim under 600 KB. These ship in the repo and 36 of them adds up. |

The first video frame should match the poster, so the swap on hover is
invisible.

## Prefer mp4 over gif

A GIF works — the card renders it as an image rather than a `<video>`, mounted
only while hovered so it still starts from the top and still sits out
`prefers-reduced-motion`. What it cannot do is look as good: 256 colours means
banding on gradients and dithering on soft shadows, and matching an mp4's
fidelity costs several times the bytes. Use one when the recording is flat UI
with few colours; reach for mp4 for anything with a gradient, a blur or a
photo.

## Recipe

With ffmpeg (`winget install Gyan.FFmpeg`), from a screen recording:

```bash
ffmpeg -i raw.mov -an -vf "scale=1280:800:force_original_aspect_ratio=increase,crop=1280:800,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 30 -movflags +faststart sliding-tabs-preview.mp4
ffmpeg -i sliding-tabs-preview.mp4 -frames:v 1 -q:v 80 sliding-tabs-poster.webp
```

`-an` drops the audio track; the card is muted anyway and the bytes are wasted.
