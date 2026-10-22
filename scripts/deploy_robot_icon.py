import os
import sys
import base64
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

print("[*] Generating icons from robot_app_icon.png...")
src_png = r"d:\dự án antigravity\AIForge_Veo3_Studio\scripts\robot_app_icon.png"
base_dir = r"d:\dự án antigravity\AIForge_Veo3_Studio"
assets_dir = os.path.join(base_dir, "assets")

im = Image.open(src_png)

# 1. Save 512x512 master PNGs
im_512 = im.resize((512, 512), Image.Resampling.LANCZOS)
im_512.save(os.path.join(assets_dir, "app-icon.png"), format="PNG", optimize=True)
im_512.save(os.path.join(assets_dir, "app-icon-rounded.png"), format="PNG", optimize=True)
im_512.save(os.path.join(assets_dir, "logo.png"), format="PNG", optimize=True)

# 2. Save multi-resolution Windows ICO
im.save(os.path.join(assets_dir, "icon.ico"), format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])

# 3. Copy to app/ and app/out/renderer/
dest_dirs = [
    os.path.join(base_dir, "app"),
    os.path.join(base_dir, "app", "out", "renderer"),
    os.path.join(base_dir, "dist", "AI_VIDEO_LIBRARY_Customer_Edition"),
    os.path.join(base_dir, "dist", "AI_VIDEO_LIBRARY_Customer_Edition", "resources", "app"),
    os.path.join(base_dir, "dist", "AI_VIDEO_LIBRARY_Customer_Edition", "resources", "app", "out", "renderer")
]

for d in dest_dirs:
    if os.path.exists(d):
        im_512.save(os.path.join(d, "app-icon.png"), format="PNG", optimize=True)
        im.save(os.path.join(d, "icon.ico"), format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
        print(f"  -> Copied icons to {d}")

# 4. Generate 256x256 Base64 for JS bundle
im_256 = im.resize((256, 256), Image.Resampling.LANCZOS)
temp_b64_path = os.path.join(base_dir, "scripts", "robot_icon_256.png")
im_256.save(temp_b64_path, format="PNG", optimize=True)

with open(temp_b64_path, "rb") as f:
    b64_str = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

with open(os.path.join(base_dir, "scripts", "robot_icon_base64.txt"), "w", encoding="utf-8") as f:
    f.write(b64_str)

print(f"[*] Base64 icon generated, length: {len(b64_str)}")
print("[*] Icon deployment completed successfully!")
