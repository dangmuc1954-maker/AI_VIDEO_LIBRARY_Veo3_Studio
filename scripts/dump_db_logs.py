import sqlite3

db_path = r'C:\Users\admin\AppData\Local\Programs\AlexBright Muse Workbench\data\muse_tool.sqlite3'
con = sqlite3.connect(db_path)
cur = con.cursor()

with open('d:/dự án antigravity/AIForge_Veo3_Studio/scripts/db_logs.txt', 'w', encoding='utf-8') as out:
    out.write('--- RECENT TASKS ---\n')
    tasks = cur.execute("SELECT id, seq, prompt, status, thread_url, output_file, error, submitted_at, updated_at FROM tasks ORDER BY id DESC LIMIT 10;").fetchall()
    for row in tasks:
        out.write(str(row) + '\n')
    
    out.write('\n--- RECENT EVENTS / LOGS ---\n')
    logs = cur.execute("SELECT id, task_id, level, message, created_at FROM events ORDER BY id DESC LIMIT 50;").fetchall()
    for row in logs:
        out.write(f"[{row[4]}] [{row[2]}] (Task {row[1]}): {row[3]}\n")

print('Wrote db_logs.txt successfully!')
