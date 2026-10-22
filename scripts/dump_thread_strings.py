import re

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/thread_new_context.txt', 'rb') as f:
    data = f.read()

# find all ascii strings
strings = re.findall(rb'[\x20-\x7E]{4,}', data)
with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/thread_strings.txt', 'w', encoding='utf-8') as out:
    for s in strings:
        text = s.decode('latin1', errors='ignore').strip()
        if any(k in text.lower() for k in ['thread', 'muse', 'video', 'wait', 'click', 'fill', 'blob', 'cookie', 'download', 'selector', 'page', 'prompt']):
            out.write(text + '\n')
            print(text)
