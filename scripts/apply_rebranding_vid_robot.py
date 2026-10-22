import os
import sys
import base64
import re
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

print("======================================================================")
print("[*] BAT DAU REBRANDING: AI VIDEO LIBRARY & ICON ROBOT VID")
print("======================================================================")

base_dir = r"d:\dự án antigravity\AIForge_Veo3_Studio"
assets_dir = os.path.join(base_dir, "assets")

# 1. Read the new logo PNG and convert to Base64
with open(os.path.join(assets_dir, "logo.png"), "rb") as f:
    logo_b64 = "data:image/png;base64," + base64.b64encode(f.read()).decode("ascii")

print(f"[*] Base64 Logo length: {len(logo_b64)}")

# 2. Copy icon files to extracted_original, app, and dist
dest_dirs = [
    os.path.join(base_dir, "extracted_original", "out", "renderer"),
    os.path.join(base_dir, "app", "out", "renderer"),
    os.path.join(base_dir, "extracted_original"),
    os.path.join(base_dir, "app")
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(assets_dir, "app-icon.png"), "rb") as sf:
        with open(os.path.join(d, "app-icon.png"), "wb") as df:
            df.write(sf.read())
    with open(os.path.join(assets_dir, "icon.ico"), "rb") as sf:
        with open(os.path.join(d, "icon.ico"), "wb") as df:
            df.write(sf.read())

print("[*] Copied app-icon.png and icon.ico to all app directories.")

# 3. Patch index.html
for html_path in [
    os.path.join(base_dir, "extracted_original", "out", "renderer", "index.html"),
    os.path.join(base_dir, "app", "out", "renderer", "index.html")
]:
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()
        html = html.replace("<title>AIForge Studio</title>", "<title>AI VIDEO LIBRARY</title>")
        html = html.replace("<title>AIForge</title>", "<title>AI VIDEO LIBRARY</title>")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"[*] Patched title in {html_path}")

# 4. Patch renderer JS bundle (index-8u8DZic4.js)
for js_path in [
    os.path.join(base_dir, "extracted_original", "out", "renderer", "assets", "index-8u8DZic4.js"),
    os.path.join(base_dir, "app", "out", "renderer", "assets", "index-8u8DZic4.js")
]:
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8") as f:
            code = f.read()

        # Replace embedded logo Base64 (e0 = "data:image/png;base64,...")
        code = re.sub(r'e0="data:image/png;base64,[^"]+"', f'e0="{logo_b64}"', code)
        
        # Replace brand strings
        code = code.replace('"AIForge Studio"', '"AI VIDEO LIBRARY"')
        code = code.replace('alt:"AIForge Studio"', 'alt:"AI VIDEO LIBRARY"')
        code = code.replace('AIForge Studio', 'AI VIDEO LIBRARY')
        code = code.replace('AIForge', 'AI VIDEO LIBRARY')

        with open(js_path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"[*] Patched logo Base64 and brand text in {js_path}")

# 5. Patch package.json
for pkg_path in [
    os.path.join(base_dir, "extracted_original", "package.json"),
    os.path.join(base_dir, "app", "package.json")
]:
    if os.path.exists(pkg_path):
        with open(pkg_path, "r", encoding="utf-8") as f:
            pkg = f.read()
        pkg = pkg.replace('"name": "aiforge-studio"', '"name": "ai-video-library"')
        pkg = pkg.replace('"description": "AIForge Studio desktop app"', '"description": "AI VIDEO LIBRARY desktop app"')
        pkg = pkg.replace('"author": "AIForge Studio"', '"author": "AI VIDEO LIBRARY"')
        with open(pkg_path, "w", encoding="utf-8") as f:
            f.write(pkg)
        print(f"[*] Patched package.json in {pkg_path}")

print("======================================================================")
print("[*] REBRANDING HOAN TAT: AI VIDEO LIBRARY & LOGO ROBOT VID SAN SANG!")
print("======================================================================")
