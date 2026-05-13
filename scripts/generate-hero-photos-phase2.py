#!/usr/bin/env python3
"""
PACAA-640: Generate 3 hero photo candidates via Replicate flux-schnell.
Usage: REPLICATE_API_TOKEN=<token> python3 scripts/generate-hero-photos-phase2.py

Saves to: public/images/ai/phase2/hero-photo-{A,B,C}.webp
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

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "ai" / "phase2"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

CANDIDATES = [
    {
        "id": "A",
        "filename": "hero-photo-A.webp",
        "prompt": (
            "Photorealistic wide-angle photo of a modern Korean packaging factory floor, "
            "conveyor belt with stacked cardboard boxes moving through, a worker's hands "
            "close-up wrapping a box with kraft paper, natural daylight from large windows "
            "on the right, soft warm lighting, professional B2B industrial atmosphere, "
            "clean and organized workspace, shallow depth of field, color graded with warm "
            "earthy tones, 35mm lens look, high detail, no faces visible, no text"
        ),
    },
    {
        "id": "B",
        "filename": "hero-photo-B.webp",
        "prompt": (
            "Photorealistic studio product photography of an assortment of premium packaging "
            "boxes and containers arranged neatly on a soft cream gradient background, various "
            "sizes of corrugated kraft boxes, white minimalist boxes, eco-friendly paper "
            "packaging, tubes and pouches, subtle drop shadows, soft top-down lighting, clean "
            "modern aesthetic, designer catalog style, ultra high detail, sharp focus, no text, "
            "no logos"
        ),
    },
    {
        "id": "C",
        "filename": "hero-photo-C.webp",
        "prompt": (
            "Photorealistic top-down close-up shot of a packaging designer's wooden desk, "
            "an unfolded cardboard box mockup with subtle pattern, sheets of kraft paper, "
            "a metal ruler, a pencil, fabric swatches, a coffee cup, warm natural window "
            "light from the upper right, cozy creative studio atmosphere, depth of field "
            "bokeh on the edges, lifestyle craft photography, color graded with warm earthy "
            "tones, sharp focus on the box mockup, no text, no logos"
        ),
    },
]

TARGET_KB = 200

def generate_and_save(candidate: dict) -> None:
    print(f"\n[{candidate['id']}] Generating {candidate['filename']}...")
    output = replicate.run(
        "black-forest-labs/flux-schnell",
        input={
            "prompt": candidate["prompt"],
            "aspect_ratio": "16:9",
            "output_format": "webp",
            "output_quality": 90,
            "safety_tolerance": 2,
            "num_outputs": 1,
        },
    )
    # output is a list of URLs or file-like objects
    url = output[0] if isinstance(output[0], str) else str(output[0])
    print(f"  Downloading from {url[:60]}...")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()

    img = Image.open(BytesIO(resp.content)).convert("RGB")
    # Resize to 1920x1080 if needed
    if img.size != (1920, 1080):
        img = img.resize((1920, 1080), Image.LANCZOS)

    out_path = OUTPUT_DIR / candidate["filename"]
    quality = 90
    img.save(out_path, "WEBP", quality=quality)
    size_kb = out_path.stat().st_size / 1024
    # Reduce quality if over target
    while size_kb > TARGET_KB and quality > 60:
        quality -= 5
        img.save(out_path, "WEBP", quality=quality)
        size_kb = out_path.stat().st_size / 1024
    print(f"  Saved {out_path.name}: {size_kb:.1f} KB (quality={quality})")

for i, c in enumerate(CANDIDATES):
    if i > 0:
        time.sleep(12)
    generate_and_save(c)

print("\nAll 3 hero photo candidates generated.")
print(f"Files in {OUTPUT_DIR}:")
for f in sorted(OUTPUT_DIR.glob("hero-photo-*.webp")):
    print(f"  {f.name}: {f.stat().st_size / 1024:.1f} KB")
