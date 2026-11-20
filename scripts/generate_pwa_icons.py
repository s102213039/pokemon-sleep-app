"""
generate_pwa_icons.py — Full-Bleed Twilight Crescent Moon PWA Icon Generator
============================================================================
Generates crisp, multi-resolution full-bleed PWA icons and favicons for
Pokemon Sleep Calculators.
Design theme: Blue-Purple Twilight Gradient with Glowing Crescent Moon and
Soft Four-Point Sparkle Points.
Adheres strictly to the Global Zero Emoji Policy (Rule 8) and Zero Decorative
Glyph Policy (Rule 10): pure vector/raster geometry with 100% opaque canvas.

Outputs:
  - assets/icons/favicon.svg (Full-bleed 512x512 SVG vector)
  - assets/icons/icon-192.png (192x192 opaque PNG)
  - assets/icons/icon-512.png (512x512 opaque PNG)
  - assets/icons/icon-maskable.png (512x512 opaque maskable PNG)
  - assets/icons/apple-touch-icon.png (180x180 opaque PNG)
  - favicon.ico (multi-size ICO: 16x16, 32x32, 48x48)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(ROOT_DIR, 'assets', 'icons')
os.makedirs(ICONS_DIR, exist_ok=True)

# 1. Full-Bleed SVG Vector Icon (512x512, zero rx/ry corner cutout)
SVG_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e1330" />
      <stop offset="48%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#151338" />
    </linearGradient>
    <radialGradient id="twilightCenterGlow" cx="50%" cy="48%" r="52%">
      <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.58" />
      <stop offset="55%" stop-color="#3730a3" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#0e1330" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="moonAmbientHalo" cx="48%" cy="50%" r="36%">
      <stop offset="0%" stop-color="#fde047" stop-opacity="0.28" />
      <stop offset="55%" stop-color="#818cf8" stop-opacity="0.14" />
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="moonGrad" x1="15%" y1="12%" x2="85%" y2="88%">
      <stop offset="0%" stop-color="#fef9c3" />
      <stop offset="45%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0e7ff" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.14" />
    </linearGradient>
    <filter id="moonGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="sparkleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Full-Bleed Opaque Twilight Background (no rx/ry transparent corners) -->
  <rect width="512" height="512" fill="url(#bgGrad)" />
  <rect width="512" height="512" fill="url(#twilightCenterGlow)" />
  <circle cx="250" cy="256" r="180" fill="url(#moonAmbientHalo)" />

  <!-- Subtle Concentric Twilight Sleep Aura Rings -->
  <circle cx="256" cy="256" r="158" fill="none" stroke="#a5b4fc" stroke-width="2" opacity="0.24" />
  <circle cx="256" cy="256" r="134" fill="none" stroke="#c7d2fe" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.22" />

  <!-- Soft Twilight Slumber Mist Accent -->
  <path d="M 164 334 C 164 316, 182 304, 202 308 C 212 292, 238 290, 252 304 C 266 296, 288 302, 294 318 C 310 318, 322 330, 320 344 C 320 356, 306 364, 288 364 L 184 364 C 170 364, 164 350, 164 334 Z" fill="url(#cloudGrad)" />

  <!-- Luminous Golden-Cream Crescent Moon -->
  <path d="M 292 140 A 118 118 0 1 0 348 332 A 98 98 0 1 1 292 140 Z" fill="url(#moonGrad)" filter="url(#moonGlow)" />

  <!-- Four-Point Soft Sparkle Points -->
  <path d="M 332 154 Q 332 178 356 178 Q 332 178 332 202 Q 332 178 308 178 Q 332 178 332 154 Z" fill="#fef9c3" filter="url(#sparkleGlow)" />
  <path d="M 162 158 Q 162 174 178 174 Q 162 174 162 190 Q 162 174 146 174 Q 162 174 162 158 Z" fill="#e0e7ff" filter="url(#sparkleGlow)" opacity="0.92" />
  <path d="M 358 256 Q 358 270 372 270 Q 358 270 358 284 Q 358 270 344 270 Q 358 270 358 256 Z" fill="#bae6fd" filter="url(#sparkleGlow)" opacity="0.9" />
  <path d="M 284 212 Q 284 221 293 221 Q 284 221 284 230 Q 284 221 275 221 Q 284 221 284 212 Z" fill="#fde047" opacity="0.88" />

  <!-- Soft Ambient Starlight Dots -->
  <circle cx="218" cy="144" r="3.5" fill="#e0e7ff" opacity="0.85" />
  <circle cx="366" cy="216" r="3" fill="#fef08a" opacity="0.82" />
  <circle cx="144" cy="264" r="3" fill="#bae6fd" opacity="0.78" />
  <circle cx="336" cy="364" r="3.5" fill="#c7d2fe" opacity="0.8" />
  <circle cx="192" cy="372" r="2.5" fill="#e0e7ff" opacity="0.72" />
</svg>
'''

svg_path = os.path.join(ICONS_DIR, 'favicon.svg')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(SVG_CONTENT)
print(f"[PWA] Wrote full-bleed SVG vector icon to {svg_path}")


def build_twilight_background(target_size):
    """
    Create a 100% opaque full-bleed blue-purple twilight background gradient.
    Outer edges remain deep twilight navy-indigo (lum ~ 22..38, well below 120),
    smoothly transitioning to a rich indigo-violet center glow.
    """
    grid_size = 160
    bg_small = Image.new('RGBA', (grid_size, grid_size), (14, 19, 48, 255))
    pixels = bg_small.load()

    for y in range(grid_size):
        ny = y / (grid_size - 1.0)
        for x in range(grid_size):
            nx = x / (grid_size - 1.0)

            # Diagonal linear twilight base (top-left deep navy to bottom-right deep violet-navy)
            diag = 0.52 * ny + 0.48 * nx
            base_r = 13.0 + 13.0 * diag
            base_g = 17.0 + 7.0 * (1.0 - abs(diag - 0.5) * 2.0)
            base_b = 44.0 + 18.0 * diag

            # Radial twilight indigo-violet center glow (confined away from outer borders)
            dist = math.hypot(nx - 0.50, ny - 0.49) / 0.56
            if dist < 1.0:
                # Smooth cubic falloff so outer 8% border has zero radial boost
                t = 1.0 - dist
                glow = t * t * (3.0 - 2.0 * t)
            else:
                glow = 0.0

            r = int(min(255, round(base_r + 58.0 * glow)))
            g = int(min(255, round(base_g + 48.0 * glow)))
            b = int(min(255, round(base_b + 126.0 * glow)))
            pixels[x, y] = (r, g, b, 255)

    return bg_small.resize((target_size, target_size), Image.Resampling.BICUBIC)


def draw_four_point_sparkle(draw, cx, cy, radius, color):
    """Draw a smooth 4-point starlight sparkle polygon centered at (cx, cy)."""
    pts = []
    steps = 32
    for i in range(steps):
        angle = (2.0 * math.pi * i) / steps
        # Superellipse / astroid curve for crisp four-point sparkle
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        rx = (abs(cos_a) ** 2.35) * radius * (1.0 if cos_a >= 0 else -1.0)
        ry = (abs(sin_a) ** 2.35) * radius * (1.0 if sin_a >= 0 else -1.0)
        pts.append((cx + rx, cy + ry))
    draw.polygon(pts, fill=color)


def draw_icon_canvas(size, safe_margin=0.0):
    """
    Draw a full-bleed opaque raster icon using Pillow with 4x supersampling.
    All bright artwork is strictly contained within the inner safe zone.
    """
    scale = 4
    img_size = size * scale

    # 1. Opaque full-bleed twilight background
    img = build_twilight_background(img_size)

    margin = img_size * safe_margin
    content_size = img_size - 2.0 * margin
    cx = img_size / 2.0
    cy = img_size / 2.0

    # 2. Soft ambient moon halo (strictly inside safe zone)
    halo_layer = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    halo_draw = ImageDraw.Draw(halo_layer)
    halo_r = content_size * 0.25
    halo_draw.ellipse(
        [cx - halo_r * 1.05, cy - halo_r * 0.98, cx + halo_r * 0.95, cy + halo_r * 1.02],
        fill=(129, 140, 248, 52)
    )
    inner_halo_r = content_size * 0.19
    halo_draw.ellipse(
        [cx - inner_halo_r * 1.1, cy - inner_halo_r * 0.9, cx + inner_halo_r * 0.9, cy + inner_halo_r * 1.1],
        fill=(253, 224, 71, 48)
    )
    halo_layer = halo_layer.filter(ImageFilter.GaussianBlur(radius=content_size * 0.045))
    img = Image.alpha_composite(img, halo_layer)

    # 3. Subtle concentric twilight aura ring & slumber cloud mist
    aura_layer = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    aura_draw = ImageDraw.Draw(aura_layer)

    ring_outer_r = content_size * 0.305
    aura_draw.ellipse(
        [cx - ring_outer_r, cy - ring_outer_r, cx + ring_outer_r, cy + ring_outer_r],
        outline=(165, 180, 252, 64),
        width=max(2, int(content_size * 0.0045))
    )

    ring_inner_r = content_size * 0.262
    aura_draw.ellipse(
        [cx - ring_inner_r, cy - ring_inner_r, cx + ring_inner_r, cy + ring_inner_r],
        outline=(199, 210, 254, 46),
        width=max(1, int(content_size * 0.0032))
    )

    # Soft slumber cloud mist at bottom of crescent
    cloud_y = cy + content_size * 0.145
    cloud_x = cx - content_size * 0.02
    cloud_blobs = [
        (cloud_x - content_size * 0.10, cloud_y + content_size * 0.01, content_size * 0.055, content_size * 0.036),
        (cloud_x - content_size * 0.03, cloud_y - content_size * 0.01, content_size * 0.072, content_size * 0.046),
        (cloud_x + content_size * 0.055, cloud_y + content_size * 0.005, content_size * 0.062, content_size * 0.038),
        (cloud_x + content_size * 0.115, cloud_y + content_size * 0.018, content_size * 0.045, content_size * 0.028),
    ]
    for bx, by, rx, ry in cloud_blobs:
        aura_draw.ellipse([bx - rx, by - ry, bx + rx, by + ry], fill=(199, 210, 254, 50))

    img = Image.alpha_composite(img, aura_layer)

    # 4. Luminous Golden-Cream Crescent Moon (boolean subtraction of two circles)
    moon_outer_r = content_size * 0.232
    moon_cx = cx - content_size * 0.018
    moon_cy = cy + content_size * 0.008

    cut_r = content_size * 0.194
    cut_cx = cx + content_size * 0.082
    cut_cy = cy - content_size * 0.066

    outer_mask = Image.new('L', (img_size, img_size), 0)
    ImageDraw.Draw(outer_mask).ellipse(
        [moon_cx - moon_outer_r, moon_cy - moon_outer_r, moon_cx + moon_outer_r, moon_cy + moon_outer_r],
        fill=255
    )

    cut_mask = Image.new('L', (img_size, img_size), 0)
    ImageDraw.Draw(cut_mask).ellipse(
        [cut_cx - cut_r, cut_cy - cut_r, cut_cx + cut_r, cut_cy + cut_r],
        fill=255
    )

    crescent_mask = ImageChops.subtract(outer_mask, cut_mask)

    # Soft golden outer bloom around crescent moon
    moon_glow_mask = crescent_mask.filter(ImageFilter.GaussianBlur(radius=content_size * 0.024))
    moon_glow_color = Image.new('RGBA', (img_size, img_size), (253, 224, 71, 0))
    moon_glow_alpha = moon_glow_mask.point(lambda p: int(p * 0.48))
    moon_glow_color.putalpha(moon_glow_alpha)
    img = Image.alpha_composite(img, moon_glow_color)

    # Smooth golden-cream gradient fill across the crescent moon
    grad_small = Image.new('RGBA', (128, 128), (253, 224, 71, 255))
    g_px = grad_small.load()
    for gy in range(128):
        ty = gy / 127.0
        for gx in range(128):
            tx = gx / 127.0
            t = min(1.0, max(0.0, 0.58 * ty + 0.42 * tx))
            if t < 0.5:
                u = t / 0.5
                # Cream light gold (254, 249, 195) -> Rich warm yellow-gold (253, 224, 71)
                r = int(round(254 - 1 * u))
                g = int(round(249 - 25 * u))
                b = int(round(195 - 124 * u))
            else:
                u = (t - 0.5) / 0.5
                # Rich warm yellow-gold (253, 224, 71) -> Warm amber-gold (245, 168, 18)
                r = int(round(253 - 8 * u))
                g = int(round(224 - 56 * u))
                b = int(round(71 - 53 * u))
            g_px[gx, gy] = (r, g, b, 255)

    moon_fill = grad_small.resize((img_size, img_size), Image.Resampling.BICUBIC)
    moon_fill.putalpha(crescent_mask)
    img = Image.alpha_composite(img, moon_fill)

    # 5. Crisp 4-Point Soft Starlight Sparkles & Star Points (all within safe zone)
    sparkle_glow_layer = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    sparkle_glow_draw = ImageDraw.Draw(sparkle_glow_layer)

    sparkle_sharp_layer = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    sparkle_sharp_draw = ImageDraw.Draw(sparkle_sharp_layer)

    sparkles = [
        # (offset_x, offset_y, radius_factor, core_color, glow_color)
        (0.148, -0.152, 0.052, (254, 249, 195, 255), (253, 224, 71, 135)),
        (-0.184, -0.160, 0.036, (224, 231, 255, 245), (165, 180, 252, 120)),
        (0.198, 0.028, 0.032, (186, 230, 253, 240), (56, 189, 248, 115)),
        (0.055, -0.068, 0.022, (254, 240, 138, 235), (250, 204, 21, 100)),
    ]

    for ox, oy, rf, core_col, glow_col in sparkles:
        sx = cx + content_size * ox
        sy = cy + content_size * oy
        sr = content_size * rf
        gr = sr * 0.72
        sparkle_glow_draw.ellipse([sx - gr, sy - gr, sx + gr, sy + gr], fill=glow_col)
        draw_four_point_sparkle(sparkle_sharp_draw, sx, sy, sr, core_col)

    # Soft circular starlight points inside safe zone
    star_dots = [
        (-0.075, -0.218, 0.0085, (224, 231, 255, 220)),
        (0.215, -0.078, 0.0075, (254, 240, 138, 215)),
        (-0.218, 0.016, 0.0075, (186, 230, 253, 205)),
        (0.156, 0.208, 0.0080, (199, 210, 254, 210)),
        (-0.125, 0.225, 0.0065, (224, 231, 255, 195)),
    ]
    for dx, dy, drf, dcol in star_dots:
        px = cx + content_size * dx
        py = cy + content_size * dy
        pr = max(1.5, content_size * drf)
        sparkle_sharp_draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=dcol)
        sparkle_glow_draw.ellipse([px - pr * 1.8, py - pr * 1.8, px + pr * 1.8, py + pr * 1.8], fill=(dcol[0], dcol[1], dcol[2], 70))

    sparkle_glow_layer = sparkle_glow_layer.filter(ImageFilter.GaussianBlur(radius=content_size * 0.012))
    img = Image.alpha_composite(img, sparkle_glow_layer)
    img = Image.alpha_composite(img, sparkle_sharp_layer)

    # Downsample with Lanczos resampling and enforce 100% opaque alpha=255 on every pixel
    final_rgb = img.convert('RGB').resize((size, size), Image.Resampling.LANCZOS)
    final_rgba = final_rgb.convert('RGBA')
    return final_rgba


# Generate standard and maskable PWA icons
img_192 = draw_icon_canvas(192, safe_margin=0.0)
img_192.save(os.path.join(ICONS_DIR, 'icon-192.png'), 'PNG')
print("[PWA] Wrote icon-192.png (192x192, full-bleed opaque)")

img_512 = draw_icon_canvas(512, safe_margin=0.0)
img_512.save(os.path.join(ICONS_DIR, 'icon-512.png'), 'PNG')
print("[PWA] Wrote icon-512.png (512x512, full-bleed opaque)")

img_maskable = draw_icon_canvas(512, safe_margin=0.08)
img_maskable.save(os.path.join(ICONS_DIR, 'icon-maskable.png'), 'PNG')
print("[PWA] Wrote icon-maskable.png (512x512, full-bleed opaque with safe zone)")

img_apple = draw_icon_canvas(180, safe_margin=0.0)
img_apple.save(os.path.join(ICONS_DIR, 'apple-touch-icon.png'), 'PNG')
print("[PWA] Wrote apple-touch-icon.png (180x180, full-bleed opaque)")

# Generate multi-resolution favicon.ico (16x16, 32x32, 48x48)
img_16 = draw_icon_canvas(16, safe_margin=0.0)
img_32 = draw_icon_canvas(32, safe_margin=0.0)
img_48 = draw_icon_canvas(48, safe_margin=0.0)

root_ico_path = os.path.join(ROOT_DIR, 'favicon.ico')
img_48.save(
    root_ico_path,
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=[img_16, img_32]
)
print(f"[PWA] Wrote multi-size favicon.ico to {root_ico_path}")
