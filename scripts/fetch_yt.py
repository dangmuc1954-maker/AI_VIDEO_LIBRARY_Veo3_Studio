import urllib.request
import json
import re

url = 'https://www.youtube.com/watch?v=fBnrXLUPX7E'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8')

title = re.search(r'<title>(.*?)</title>', html)
title_str = title.group(1) if title else 'No title'

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/yt_info.txt', 'w', encoding='utf-8') as f:
    f.write('TITLE: ' + title_str + '\n')
    m = re.search(r'var ytInitialData = ({.*?});</script>', html)
    if m:
        f.write('Found ytInitialData\n')
        try:
            data = json.loads(m.group(1))
            # try to extract videoDetails
            video_details = data.get('engagementPanels', [])
            f.write(json.dumps(data)[:2000] + '\n')
        except Exception as e:
            f.write('Error: ' + str(e) + '\n')
print('Done saving yt_info.txt')
