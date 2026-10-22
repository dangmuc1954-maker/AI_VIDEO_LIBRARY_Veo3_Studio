import os
import re

js_file = r"d:\dự án antigravity\AIForge_Veo3_Studio\extracted_original\out\renderer\assets\index-8u8DZic4.js"
with open(js_file, "r", encoding="utf-8") as f:
    code = f.read()

print("File size:", len(code))

# Search for sidebar / header brand elements
# Look for keywords like "Veo", "Nano", "ChatGPT", "Library", "Studio"
terms = ["AI Studio", "AIStudio", "AI Forge", "Video Generator", "Flow Nano", "Prompt"]
for t in terms:
    pos = code.find(t)
    if pos != -1:
        print(f"Found '{t}' at {pos}: ...{code[max(0, pos-40):min(len(code), pos+60)]}...")

# Check for navigation icons / logos
nav_patterns = re.findall(r'(\b[A-Za-z0-9_]+\.jsx\([^)]+\))', code[:30000])
print(f"First jsx items: {len(nav_patterns)}")
