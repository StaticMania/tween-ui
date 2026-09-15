# Gallery preview media

Drop files in, run `pnpm registry:build`, done. Nothing to wire up by hand —
the build scans this folder and fills each entry's `media` field.

## Naming

The filename must carry the **entry name** (`sliding-tabs`, `flip-card` …),
because everything shares this one folder. Any of these layouts work:

```
public/media/sliding-tabs-poster.webp   public/media/sliding-tabs-preview.mp4
public/media/sliding-tabs.webp          public/media/sliding-tabs.mp4
public/media/sliding-tabs/poster.webp   public/media/sliding-tabs/preview.mp4
```

Poster only = a static card. Neither = "Preview coming soon". An entry that
sets `media` by hand in `registry-ui.ts` / `registry-blocks.ts` overrides
whatever is found here.

Accepted: `.webp .avif .png .jpg .jpeg` for the poster, `.mp4 .webm` for the
video. Earlier in that list wins, so a `.webp` beats a `.png` for the same entry.

## Specs

| | |
| --- | --- |
| Aspect | **16:10** — the card crops to it with `object-cover` |
| Poster | 1280x800 webp, under ~120 KB |
| Video | 1280x800 **mp4 (H.264, yuv420p)**, 3-6s, seamless loop, **no audio track** |
| Video size | Aim under 600 KB. These ship in the repo and 36 of them adds up. |

The first video frame should match the poster, so the swap on hover is
invisible.

## Use mp4, not gif

A GIF of the same clip runs 5-15x larger (256 colours, no real interframe
compression), and it cannot be paused — it animates the moment it is on screen,
which defeats both the hover behaviour and the `prefers-reduced-motion`
handling the card does. `<video>` gives all of that for free.

## Recipe

With ffmpeg (`winget install Gyan.FFmpeg`), from a screen recording:

```bash
ffmpeg -i raw.mov -an -vf "scale=1280:800:force_original_aspect_ratio=increase,crop=1280:800,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 30 -movflags +faststart sliding-tabs-preview.mp4
ffmpeg -i sliding-tabs-preview.mp4 -frames:v 1 -q:v 80 sliding-tabs-poster.webp
```

`-an` drops the audio track; the card is muted anyway and the bytes are wasted.
