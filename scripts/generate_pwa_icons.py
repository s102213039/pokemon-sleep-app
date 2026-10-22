"""
generate_pwa_icons.py — High-Fidelity PWA Icon & Favicon Generator
==================================================================
Generates crisp, multi-resolution PWA icons and favicons for Pokemon Sleep App.
Adheres strictly to the Global Zero Emoji Policy (Rule 8): pure vector geometry.
Outputs:
  - assets/icons/favicon.svg (SVG vector)
  - assets/icons/icon-192.png (192x192 PNG)
  - assets/icons/icon-512.png (512x512 PNG)
  - assets/icons/icon-maskable.png (512x512 PNG with 15% safe-area margin)
  - assets/icons/apple-touch-icon.png (180x180 PNG)
  - favicon.ico (multi-size ICO: 16x16, 32x32, 48x48)
"""

import os
import math
from PIL import Image, ImageDraw

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ICONS_DIR = os.path.join(ROOT_DIR, 'assets', 'icons')
os.makedirs(ICONS_DIR, exist_ok=True)

# 1. Create SVG Icon
SVG_CONTENT = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#0a0f1d" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>
    <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
    <linearGradient id="ballTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="ballBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Ambient Glow Ring -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.2" />

  <!-- Stylized Crescent Sleep Moon -->
  <path d="M 320 120 A 150 150 0 1 0 380 340 A 120 120 0 0 1 320 120 Z" fill="url(#moonGrad)" filter="url(#glow)" opacity="0.95" />

  <!-- Central PokeBall: Top Dome -->
  <path d="M 166 256 A 90 90 0 0 1 346 256 Z" fill="url(#ballTopGrad)" />

  <!-- Central PokeBall: Bottom Dome -->
  <path d="M 166 256 A 90 90 0 0 0 346 256 Z" fill="url(#ballBottomGrad)" />

  <!-- Dividing Seam -->
  <line x1="166" y1="256" x2="346" y2="256" stroke="#0a0f1d" stroke-width="12" />

  <!-- Center Button Outer Ring -->
  <circle cx="256" cy="256" r="30" fill="#0a0f1d" />

  <!-- Center Button Core -->
  <circle cx="256" cy="256" r="20" fill="#ffffff" />
  <circle cx="256" cy="256" r="12" fill="#38bdf8" />

  <!-- Four-Pointed Sleep Sparkles -->
  <path d="M 380 150 Q 380 170 400 170 Q 380 170 380 190 Q 380 170 360 170 Q 380 170 380 150 Z" fill="#38bdf8" />
  <path d="M 130 150 Q 130 165 145 165 Q 130 165 130 180 Q 130 165 115 165 Q 130 165 130 150 Z" fill="#818cf8" opacity="0.85" />
  <path d="M 390 350 Q 390 360 400 360 Q 390 360 390 370 Q 390 360 380 360 Q 390 360 390 350 Z" fill="#fbbf24" opacity="0.8" />
</svg>
'''

svg_path = os.path.join(ICONS_DIR, 'favicon.svg')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(SVG_CONTENT)
print(f"[PWA] Wrote SVG vector icon to {svg_path}")


def draw_icon_canvas(size, safe_margin=0.0):
    """Draw a raster icon using Pillow with anti-aliasing."""
    scale = 4  # 4x supersampling for high fidelity
    img_size = size * scale
    img = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = img_size * safe_margin
    content_size = img_size - 2 * margin
    cx = img_size / 2
    cy = img_size / 2

    # Draw rounded background
    bg_color = (10, 15, 29, 255)
    corner_radius = content_size * 0.22
    draw.rounded_rectangle(
        [margin, margin, img_size - margin, img_size - margin],
        radius=corner_radius,
        fill=bg_color
    )

    # Ambient ring
    ring_radius = content_size * 0.38
    draw.ellipse(
        [cx - ring_radius, cy - ring_radius, cx + ring_radius, cy + ring_radius],
        outline=(56, 189, 248, 40),
        width=int(2 * scale)
    )

    # Crescent Moon
    moon_radius = content_size * 0.30
    moon_offset_x = cx + content_size * 0.05
    moon_offset_y = cy - content_size * 0.04
    draw.pieslice(
        [moon_offset_x - moon_radius, moon_offset_y - moon_radius,
         moon_offset_x + moon_radius, moon_offset_y + moon_radius],
        start=45, end=270,
        fill=(251, 191, 36, 230)
    )

    # Pokeball
    ball_r = content_size * 0.18
    ball_x0 = cx - ball_r
    ball_y0 = cy - ball_r
    ball_x1 = cx + ball_r
    ball_y1 = cy + ball_r

    # Top dome (Cyan)
    draw.pieslice([ball_x0, ball_y0, ball_x1, ball_y1], start=180, end=360, fill=(56, 189, 248, 255))
    # Bottom dome (White)
    draw.pieslice([ball_x0, ball_y0, ball_x1, ball_y1], start=0, end=180, fill=(241, 245, 249, 255))

    # Center black seam
    seam_h = max(2, int(ball_r * 0.14))
    draw.rectangle([ball_x0, cy - seam_h / 2, ball_x1, cy + seam_h / 2], fill=(10, 15, 29, 255))

    # Outer button ring
    btn_outer_r = ball_r * 0.32
    draw.ellipse([cx - btn_outer_r, cy - btn_outer_r, cx + btn_outer_r, cy + btn_outer_r], fill=(10, 15, 29, 255))

    # Inner button
    btn_inner_r = ball_r * 0.22
    draw.ellipse([cx - btn_inner_r, cy - btn_inner_r, cx + btn_inner_r, cy + btn_inner_r], fill=(255, 255, 255, 255))

    btn_core_r = ball_r * 0.12
    draw.ellipse([cx - btn_core_r, cy - btn_core_r, cx + btn_core_r, cy + btn_core_r], fill=(56, 189, 248, 255))

    # Downsample with Lanczos resampling
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img


# Generate standard icons
img_192 = draw_icon_canvas(192)
img_192.save(os.path.join(ICONS_DIR, 'icon-192.png'), 'PNG')
print(f"[PWA] Wrote icon-192.png")

img_512 = draw_icon_canvas(512)
img_512.save(os.path.join(ICONS_DIR, 'icon-512.png'), 'PNG')
print(f"[PWA] Wrote icon-512.png")

img_maskable = draw_icon_canvas(512, safe_margin=0.12)
img_maskable.save(os.path.join(ICONS_DIR, 'icon-maskable.png'), 'PNG')
print(f"[PWA] Wrote icon-maskable.png")

img_apple = draw_icon_canvas(180)
img_apple.save(os.path.join(ICONS_DIR, 'apple-touch-icon.png'), 'PNG')
print(f"[PWA] Wrote apple-touch-icon.png")

# Generate favicon.ico in root and assets/icons
img_16 = draw_icon_canvas(16)
img_32 = draw_icon_canvas(32)
img_48 = draw_icon_canvas(48)

root_ico_path = os.path.join(ROOT_DIR, 'favicon.ico')
img_48.save(
    root_ico_path,
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)],
    append_images=[img_16, img_32]
)
print(f"[PWA] Wrote multi-size favicon.ico to {root_ico_path}")
