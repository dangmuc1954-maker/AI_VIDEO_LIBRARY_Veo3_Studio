import re

def extract_strings(filepath, min_len=4):
    with open(filepath, 'rb') as f:
        data = f.read()
    strings = re.findall(b'[A-Za-z0-9_./?:=\\-#%&]{4,}', data)
    return [s.decode('latin1', errors='ignore') for s in strings]

pyd_strings = extract_strings(r'C:\Users\admin\AppData\Local\Programs\AlexBright Muse Workbench\81d243bd2c585b0f4821__mypyc.pyd')
print('Extracted from pyd:', len(pyd_strings))

keywords = ['thread', 'muse.ai', 'selector', 'video', 'page.', 'locator', 'click', 'goto', 'fill', 'evaluate', 'blob', 'cookie']
relevant = [s for s in pyd_strings if any(k in s.lower() for k in keywords)]
print('Relevant count in pyd:', len(relevant))

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/pyd_strings.txt', 'w', encoding='utf-8') as f:
    for s in relevant[:300]:
        f.write(s + '\n')

print('Saved pyd_strings.txt')
