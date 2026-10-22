import re
import json

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/fetch_yt.py', 'r', encoding='utf-8') as f:
    pass

import urllib.request
url = 'https://www.youtube.com/watch?v=fBnrXLUPX7E'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8')

desc_match = re.search(r'"description":\{"simpleText":"(.*?)"\}', html)
if not desc_match:
    desc_match = re.search(r'"shortDescription":"(.*?)"', html)

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/yt_desc.txt', 'w', encoding='utf-8') as f:
    if desc_match:
        f.write('DESCRIPTION:\n' + desc_match.group(1).encode().decode('unicode_escape') + '\n')
    else:
        f.write('No desc found\n')
