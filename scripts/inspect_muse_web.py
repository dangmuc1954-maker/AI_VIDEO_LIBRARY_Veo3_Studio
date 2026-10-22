import urllib.request
import re

url = 'https://muse.ai/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    print('HTML length:', len(html))
    scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
    print('Scripts found:', len(scripts))
    with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_scripts.txt', 'w', encoding='utf-8') as f:
        for s in scripts:
            f.write(s + '\n')
            print('  ', s)
except Exception as e:
    print('Error:', e)
