with open(r"d:\dự án antigravity\AIForge_Veo3_Studio\extracted_original\out\renderer\assets\index-8u8DZic4.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Look for lucide icons or sidebar rendering
# In Lucide React, icons like Sparkles, Bot, Video, Wand2, Key, Settings, Zap, Play, Layers are used
matches = re.finditer(r'(Workflow|Generator|History|Settings|License)', code)
positions = [m.start() for m in matches]

# Let's inspect where the main App layout / Sidebar / Header is defined
for pos in positions[:10]:
    snippet = code[max(0, pos-200):min(len(code), pos+200)]
    if 'sidebar' in snippet.lower() or 'nav' in snippet.lower() or 'header' in snippet.lower() or 'logo' in snippet.lower():
        print(f"--- MATCH AT {pos} ---")
        print(snippet)
        print()
