import urllib.request
import re

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_scripts.txt', 'r', encoding='utf-8') as f:
    scripts = [line.strip() for line in f if line.strip()]

for s in scripts:
    url = 'https://muse.ai' + s
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req).read().decode('utf-8')
        if '/api/v1/im' in js or 'api/v1/im' in js:
            print('FOUND IN CHUNK:', s)
            idx = js.find('api/v1/im')
            snippet = js[max(0, idx - 400): min(len(js), idx + 800)]
            print('SNIPPET:')
            print(snippet)
            with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/im_snippet.txt', 'w', encoding='utf-8') as out:
                out.write(snippet)
            break
    except Exception as e:
        pass
