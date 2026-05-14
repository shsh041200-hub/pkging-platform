#!/usr/bin/env python3
"""
PACAA-703: Generate 9 category hero images via Replicate flux-dev.
Usage: REPLICATE_API_TOKEN=<token> python3 scripts/generate-category-heroes.py

Saves to: public/images/ai/categories/<slug>-hero.webp
Requires: pip install replicate requests pillow
"""
import os
import sys
import time
import requests
import replicate
from pathlib import Path
from PIL import Image
from io import BytesIO

API_TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not API_TOKEN:
    print("ERROR: REPLICATE_API_TOKEN environment variable not set", file=sys.stderr)
    sys.exit(1)

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "ai" / "categories"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CATEGORIES = [
    {
        "slug": "food-beverage",
        "filename": "food-beverage-hero.webp",
        "prompt": (
            "Photorealistic wide-angle shot of premium Korean food and beverage packaging products "
            "arranged on a clean studio surface: glass bottles, aluminum cans, kraft paper pouches, "
            "plastic containers with colorful food labels, fresh ingredients nearby, soft natural "
            "daylight from above, clean white background with subtle shadows, professional product "
            "photography style, high detail, no text, no logos, 16:9 composition, left side "
            "slightly open for text overlay"
        ),
    },
    {
        "slug": "ecommerce-shipping",
        "filename": "ecommerce-shipping-hero.webp",
        "prompt": (
            "Photorealistic wide-angle photo of a modern Korean e-commerce fulfillment warehouse, "
            "neat rows of brown corrugated cardboard boxes stacked on shelves, conveyor belt with "
            "packages in motion, bubble wrap and packing tape on a workstation, warm industrial "
            "lighting, organized and efficient atmosphere, shallow depth of field, professional B2B "
            "logistics setting, no faces visible, no text, no logos, 16:9 composition with left "
            "side open for text overlay"
        ),
    },
    {
        "slug": "cosmetics-beauty",
        "filename": "cosmetics-beauty-hero.webp",
        "prompt": (
            "Photorealistic top-down studio photography of luxury cosmetics packaging: elegant "
            "glass perfume bottles, sleek white and gold skincare jars, cream tubes, a magnetic "
            "gift box with ribbon, minimalist design, arranged on a marble surface with soft "
            "petals and greenery accents, clean pastel pink background, soft diffused lighting, "
            "upscale beauty brand aesthetic, ultra high detail, no text, no logos, 16:9 with "
            "left side open for text overlay"
        ),
    },
    {
        "slug": "pharma-health",
        "filename": "pharma-health-hero.webp",
        "prompt": (
            "Photorealistic studio photo of pharmaceutical and health supplement packaging: "
            "amber glass medicine bottles, white HDPE containers, blister packs, health supplement "
            "pouches, clinical and clean aesthetic, arranged on a light gray surface, precise soft "
            "lighting, medical grade professional atmosphere, no pills visible, no text, no logos, "
            "16:9 composition with left side slightly open for text overlay"
        ),
    },
    {
        "slug": "electronics-industrial",
        "filename": "electronics-industrial-hero.webp",
        "prompt": (
            "Photorealistic wide-angle photo of industrial electronics packaging materials: "
            "ESD anti-static bags, custom foam inserts protecting circuit boards, vacuum-formed "
            "plastic trays, corrugated boxes with foam padding, clean factory setting, cool "
            "industrial lighting, organized precision atmosphere, no circuit boards visible only "
            "packaging materials, no text, no logos, 16:9 composition with left side open for "
            "text overlay"
        ),
    },
    {
        "slug": "label-sticker",
        "filename": "label-sticker-hero.webp",
        "prompt": (
            "Photorealistic macro studio photography of premium label and sticker printing: "
            "rolls of colorful product labels on a white printing surface, barcode stickers, "
            "glossy and matte finish samples, a label printing machine in soft background blur, "
            "clean professional printing studio, bright overhead lighting, detail-focused "
            "composition, no text on labels, no logos, 16:9 with left side open for text overlay"
        ),
    },
    {
        "slug": "printing-postprocess",
        "filename": "printing-postprocess-hero.webp",
        "prompt": (
            "Photorealistic wide-angle photo of a professional Korean packaging printing workshop: "
            "printed cardboard packaging sheets with UV coating gloss finish, foil stamping samples "
            "catching light, embossed box designs, a large offset printing machine in background, "
            "color swatches on the table, warm studio lighting, expert craftsman hands adjusting "
            "materials, no faces visible, no text, no logos, 16:9 with left side open for overlay"
        ),
    },
    {
        "slug": "packaging-accessories",
        "filename": "packaging-accessories-hero.webp",
        "prompt": (
            "Photorealistic flat lay studio photography of packaging accessories and materials: "
            "rolls of OPP tape and kraft tape, sheets of bubble wrap, honeycomb paper padding, "
            "PP strapping bands, EPE foam rolls, stretch film, all arranged neatly on a clean "
            "white surface, soft overhead lighting, organized professional layout, high detail, "
            "no text, no logos, 16:9 composition with left side open for text overlay"
        ),
    },
    {
        "slug": "packaging-machinery",
        "filename": "packaging-machinery-hero.webp",
        "prompt": (
            "Photorealistic wide-angle photo of a modern Korean packaging automation factory: "
            "industrial automatic filling machine and heat sealing equipment on a production line, "
            "clean stainless steel machinery, conveyor belts, workers in uniforms in blurred "
            "background, bright industrial fluorescent lighting, professional manufacturing "
            "atmosphere, no faces visible clearly, no text, no logos, 16:9 with left side "
            "open for text overlay"
        ),
    },
]

TARGET_KB = 250
TARGET_W, TARGET_H = 1920, 1080


def generate_and_save(category: dict) -> None:
    out_path = OUTPUT_DIR / category["filename"]
    if out_path.exists():
        print(f"  [SKIP] {category['filename']} already exists ({out_path.stat().st_size / 1024:.1f} KB)")
        return

    print(f"\n[{category['slug']}] Generating {category['filename']}...")
    output = replicate.run(
        "black-forest-labs/flux-dev",
        input={
            "prompt": category["prompt"],
            "aspect_ratio": "16:9",
            "output_format": "webp",
            "output_quality": 90,
            "safety_tolerance": 2,
            "num_outputs": 1,
            "guidance": 3.5,
            "num_inference_steps": 28,
        },
    )
    url = output[0] if isinstance(output[0], str) else str(output[0])
    print(f"  Downloading from {url[:80]}...")
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()

    img = Image.open(BytesIO(resp.content)).convert("RGB")
    if img.size != (TARGET_W, TARGET_H):
        img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    quality = 90
    img.save(out_path, "WEBP", quality=quality)
    size_kb = out_path.stat().st_size / 1024
    while size_kb > TARGET_KB and quality > 60:
        quality -= 5
        img.save(out_path, "WEBP", quality=quality)
        size_kb = out_path.stat().st_size / 1024
    print(f"  Saved {out_path.name}: {size_kb:.1f} KB (quality={quality})")


for i, cat in enumerate(CATEGORIES):
    if i > 0:
        time.sleep(8)
    generate_and_save(cat)

print("\nAll category hero images generated.")
print(f"Files in {OUTPUT_DIR}:")
for f in sorted(OUTPUT_DIR.glob("*-hero.webp")):
    print(f"  {f.name}: {f.stat().st_size / 1024:.1f} KB")
