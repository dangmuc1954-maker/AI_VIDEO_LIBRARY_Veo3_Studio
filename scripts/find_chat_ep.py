import urllib.request
import re

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_scripts.txt', 'r', encoding='utf-8') as f:
    scripts = [line.strip() for line in f if line.strip()]

found = []

for s in scripts:
    url = 'https://muse.ai' + s
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        js = urllib.request.urlopen(req).read().decode('utf-8')
        # Search for graphql, prompt, video generation, chat endpoints
        endpoints = re.findall(r'["\'](https?://[^"\']+|/[a-zA-Z0-9_\-\./]+(?:message|chat|video|graphql|generate|prompt)[^"\']*)["\']', js, re.IGNORECASE)
        for ep in endpoints:
            if any(k in ep.lower() for k in ['message', 'chat', 'graphql', 'generate', 'prompt', 'video']):
                if len(ep) < 120:
                    found.append((s, ep))
    except Exception as e:
        pass

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/chat_endpoints.txt', 'w', encoding='utf-8') as f:
    for s, ep in found[:100]:
        f.write(f'{s} -> {ep}\n')
        print(f'{ep}')
