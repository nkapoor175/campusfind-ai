"""
Draws the simple item illustrations used by the demo data (demo/images/*.png).

Run from the repo root with any Python that has Pillow, for example the image service's venv:
    ml-service\\.venv\\Scripts\\python.exe demo\\make_images.py

The PNGs are committed, so you only need this to change or regenerate them.
"""
import os
from PIL import Image, ImageDraw

SIZE = 320
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(OUT, exist_ok=True)


def canvas(bg=(238, 236, 230)):
    img = Image.new("RGB", (SIZE, SIZE), bg)
    return img, ImageDraw.Draw(img)


def save(img, name):
    img.save(os.path.join(OUT, name), format="PNG", optimize=True)
    print("wrote", name)


# --- blue steel water bottle ------------------------------------------------
img, d = canvas()
d.rounded_rectangle([115, 70, 205, 285], radius=28, fill=(40, 90, 200))
d.rounded_rectangle([135, 35, 185, 78], radius=8, fill=(25, 45, 120))
d.rectangle([128, 150, 192, 215], fill=(235, 240, 250))          # college sticker
d.ellipse([145, 168, 175, 198], fill=(220, 60, 60))
d.rounded_rectangle([128, 90, 142, 270], radius=6, fill=(110, 150, 235))  # highlight
save(img, "bottle.png")

# --- black earbuds in a charging case ----------------------------------------
img, d = canvas()
d.rounded_rectangle([70, 110, 250, 230], radius=45, fill=(30, 30, 34))
d.line([70, 170, 250, 170], fill=(70, 70, 76), width=3)
d.ellipse([150, 188, 170, 208], fill=(60, 200, 90))
d.ellipse([95, 60, 135, 120], fill=(20, 20, 24))                 # left bud
d.ellipse([185, 60, 225, 120], fill=(20, 20, 24))                # right bud
d.rectangle([108, 112, 122, 135], fill=(20, 20, 24))
d.rectangle([198, 112, 212, 135], fill=(20, 20, 24))
save(img, "earbuds.png")

# --- black backpack -----------------------------------------------------------
img, d = canvas()
d.rounded_rectangle([85, 75, 235, 285], radius=40, fill=(32, 32, 36))
d.arc([120, 30, 200, 110], start=180, end=360, fill=(32, 32, 36), width=12)   # top handle
d.rounded_rectangle([110, 175, 210, 255], radius=18, fill=(55, 55, 62))        # front pocket
d.line([110, 195, 210, 195], fill=(90, 90, 98), width=3)
d.ellipse([150, 120, 170, 140], fill=(200, 160, 40))
d.line([100, 90, 100, 270], fill=(18, 18, 22), width=8)
d.line([220, 90, 220, 270], fill=(18, 18, 22), width=8)
save(img, "backpack.png")

# --- brown leather wallet with an ID card -------------------------------------
img, d = canvas()
d.rounded_rectangle([120, 55, 225, 130], radius=8, fill=(250, 250, 252))      # ID card peeking out
d.rectangle([132, 68, 165, 100], fill=(170, 190, 220))
d.line([175, 75, 212, 75], fill=(120, 120, 130), width=4)
d.line([175, 90, 205, 90], fill=(120, 120, 130), width=4)
d.rounded_rectangle([60, 105, 260, 250], radius=18, fill=(120, 72, 38))
d.rounded_rectangle([68, 113, 252, 242], radius=14, outline=(200, 150, 100), width=3)
d.rounded_rectangle([205, 160, 262, 200], radius=10, fill=(95, 55, 28))
d.ellipse([228, 172, 242, 188], fill=(210, 175, 80))
save(img, "wallet.png")

# --- silver keys on a ring with a red tag --------------------------------------
img, d = canvas()
d.ellipse([105, 40, 215, 150], outline=(150, 150, 158), width=8)
for x, tilt in [(95, -6), (145, 0), (195, 6)]:
    d.rounded_rectangle([x, 150, x + 38, 205], radius=16, fill=(185, 185, 195))
    d.ellipse([x + 11, 164, x + 27, 180], fill=(238, 236, 230))
    d.rectangle([x + 15, 205, x + 24, 275], fill=(185, 185, 195))
    d.rectangle([x + 24, 250, x + 36, 262], fill=(185, 185, 195))
    d.rectangle([x + 24, 232, x + 33, 242], fill=(185, 185, 195))
d.rounded_rectangle([140, 50, 180, 105], radius=10, fill=(205, 40, 45))        # red tag
d.ellipse([153, 58, 167, 72], fill=(238, 236, 230))
save(img, "keys.png")

# --- blue umbrella with a wooden handle ----------------------------------------
img, d = canvas()
d.pieslice([40, 50, 280, 290], start=180, end=360, fill=(35, 85, 190))
for x in (100, 160, 220):
    d.line([160, 170, x, 170], fill=(20, 50, 130), width=3)
d.line([160, 170, 160, 255], fill=(90, 60, 30), width=8)
d.arc([160, 235, 205, 285], start=0, end=180, fill=(90, 60, 30), width=8)
save(img, "umbrella.png")

# --- black over-ear headphones (used by the LIVE demo, not by the seeded data) -
img, d = canvas()
d.arc([70, 50, 250, 230], start=180, end=360, fill=(28, 28, 32), width=18)
d.rounded_rectangle([55, 130, 115, 235], radius=26, fill=(30, 30, 36))
d.rounded_rectangle([205, 130, 265, 235], radius=26, fill=(30, 30, 36))
d.rounded_rectangle([68, 150, 102, 215], radius=14, fill=(55, 55, 64))
d.rounded_rectangle([218, 150, 252, 215], radius=14, fill=(55, 55, 64))
d.rectangle([150, 40, 170, 56], fill=(200, 200, 205))
save(img, "headphones.png")
