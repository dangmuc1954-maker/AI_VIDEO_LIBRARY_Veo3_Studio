import re

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_browser_code.txt', 'rb') as f:
    data = f.read()

# Python marshal / code object strings
strings = re.findall(rb'[\x20-\x7E]{3,}', data)
lines = []
for s in strings:
    t = s.decode('latin1', errors='ignore').strip()
    if t:
        lines.append(t)

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/mb_readable.txt', 'w', encoding='utf-8') as out:
    for l in lines:
        out.write(l + '\n')

print(f'Wrote {len(lines)} readable tokens')
