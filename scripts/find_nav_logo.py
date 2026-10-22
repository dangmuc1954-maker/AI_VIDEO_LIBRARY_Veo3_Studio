with open(r"d:\dự án antigravity\AIForge_Veo3_Studio\extracted_original\out\renderer\assets\index-8u8DZic4.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Look for sidebar or navbar tabs
tabs = ["Workflow", "Canvas", "Generator", "History", "Templates", "Presets", "Config", "Settings", "License"]
for tab in tabs:
    matches = [m.start() for m in re.finditer(re.escape(tab), code, re.IGNORECASE)]
    print(f"Tab '{tab}': {len(matches)} occurrences")

# Find the header / sidebar logo rendering
# Search for logo or icon img tag
imgs = re.findall(r'<img[^>]+>', code)
print(f"Total img tags: {len(imgs)}")
for img in imgs[:10]:
    print("  img:", img)

# Search for SVG logos
svgs = re.findall(r'(\b[A-Za-z0-9_]+\.svg\b|\b[A-Za-z0-9_]+\.png\b)', code)
print("Image assets referenced:", set(svgs))
