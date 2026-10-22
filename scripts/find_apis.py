import urllib.request
import re

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_scripts.txt', 'r', encoding='utf-8') as f:
    scripts = [line.strip() for line in f if line.strip()]

found_apis = set()

for s in scripts:
    url = 'https://muse.ai' + s
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req).read().decode('utf-8')
        apis = re.findall(r'["\'](/api/[^"\'\s?]+)', js)
        for a in apis:
            found_apis.add(a)
    except Exception as e:
        pass

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_apis.txt', 'w', encoding='utf-8') as f:
    for a in sorted(found_apis):
        f.write(a + '\n')
        print(a)
