with open(r"d:\dự án antigravity\AIForge_Veo3_Studio\extracted_original\out\renderer\assets\index-8u8DZic4.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Look for createRoot or render
match = re.search(r'createRoot\([^)]+\)\.render\(', code)
if match:
    pos = match.start()
    print("createRoot at:", pos)
    print("Surrounding:", code[pos-500:pos+500])

# Look for what is rendered at the top left
# E.g. brand titles, icons
brand_strings = re.findall(r'\"([A-Za-z0-9\s]{3,30})\"', code)
print("Unique strings sample:", [s for s in set(brand_strings) if any(w in s.lower() for w in ['ai', 'studio', 'forge', 'video', 'flow', 'hub'])][:20])
