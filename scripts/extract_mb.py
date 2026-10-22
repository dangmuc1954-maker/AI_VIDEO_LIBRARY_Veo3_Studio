with open(r'C:\Users\admin\AppData\Local\Programs\AlexBright Muse Workbench\MuseWorkbench.exe', 'rb') as f:
    data = f.read()

idx = data.find(b'MuseBrowser.generate')
if idx != -1:
    start = max(0, idx - 4000)
    end = min(len(data), idx + 8000)
    chunk = data[start:end]
    with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/muse_browser_code.txt', 'wb') as out:
        out.write(chunk)
    print('Found and saved muse_browser_code.txt!')
else:
    print('Not found')
