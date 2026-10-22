import re

def search_binary(filepath, keywords):
    with open(filepath, 'rb') as f:
        data = f.read()
    print('Binary size:', len(data))
    
    # Search for occurrences of 'muse.ai'
    matches = []
    for m in re.finditer(rb'https?://[a-zA-Z0-9_\-\./:]*muse\.ai[a-zA-Z0-9_\-\./:\?#=]*', data):
        matches.append(m.group(0).decode('latin1', errors='ignore'))
    
    print('Found muse.ai URLs:', len(matches))
    for u in set(matches):
        print('  URL:', u)

    # Search for python function names or selectors around muse
    selectors = []
    for m in re.finditer(rb'button|textarea|input|blob:|playwright|chromium', data):
        start = max(0, m.start() - 30)
        end = min(len(data), m.end() + 50)
        chunk = data[start:end]
        # clean ascii
        clean = re.sub(rb'[^\x20-\x7E]', b' ', chunk).decode('latin1', errors='ignore').strip()
        if len(clean) > 15:
            selectors.append(clean)
    
    print('Sample selector/action chunks:', len(selectors))
    with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/exe_findings.txt', 'w', encoding='utf-8') as out:
        out.write('--- URLS ---\n')
        for u in set(matches):
            out.write(u + '\n')
        out.write('\n--- CHUNKS ---\n')
        for c in selectors[:200]:
            out.write(c + '\n')

search_binary(r'C:\Users\admin\AppData\Local\Programs\AlexBright Muse Workbench\MuseWorkbench.exe', ['muse.ai'])
