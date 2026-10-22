with open(r"d:\dự án antigravity\AIForge_Veo3_Studio\extracted_original\out\renderer\assets\index-8u8DZic4.js", "r", encoding="utf-8") as f:
    code = f.read()

import re

# Look for header or navigation components
matches = re.finditer(r'\"(Workflows|Activity|Browser Hub|Settings|License)\"', code)
for m in matches:
    pos = m.start()
    print(f"--- MATCH {m.group(0)} AT {pos} ---")
    print(code[max(0, pos-300):min(len(code), pos+300)])
    print("="*60)
