with open(r'C:\Users\admin\AppData\Local\Programs\AlexBright Muse Workbench\MuseWorkbench.exe', 'rb') as f:
    data = f.read()

idx = 0
found = []
while True:
    idx = data.find(b'thread/new', idx)
    if idx == -1:
        break
    start = max(0, idx - 500)
    end = min(len(data), idx + 1000)
    chunk = data[start:end]
    found.append(chunk)
    idx += 10

print('Occurrences of thread/new:', len(found))
with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/thread_new_context.txt', 'wb') as out:
    for i, c in enumerate(found):
        out.write(f'\n=== CHUNK {i} ===\n'.encode())
        out.write(c)

print('Saved thread_new_context.txt')
