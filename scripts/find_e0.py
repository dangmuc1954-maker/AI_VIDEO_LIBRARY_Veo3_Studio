with open(r"d:\dự án antigravity\AIForge_Veo3_Studio\extracted_original\out\renderer\assets\index-8u8DZic4.js", "r", encoding="utf-8") as f:
    code = f.read()

import re
matches = [m.start() for m in re.finditer(r'AIForge Studio', code)]
print(f"Total 'AIForge Studio' in JS: {len(matches)}")
for pos in matches:
    print(f"At {pos}:", code[max(0, pos-100):min(len(code), pos+150)])
    print("-" * 50)

# Find definition of e0
match_e0 = re.search(r'\b(e0\s*=\s*[^;]+;)', code)
if match_e0:
    print("e0 definition:", match_e0.group(0))
