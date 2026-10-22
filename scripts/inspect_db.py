import sqlite3

db_path = r'C:\Users\admin\AppData\Local\Programs\AlexBright Muse Workbench\data\muse_tool.sqlite3'
con = sqlite3.connect(db_path)
cur = con.cursor()
tables = cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table';").fetchall()
for t, sql in tables:
    print('TABLE:', t)
    print(sql)
    print('-'*40)

# Check recent tasks
print('\nRECENT TASKS:')
try:
    tasks = cur.execute("SELECT * FROM tasks ORDER BY id DESC LIMIT 5;").fetchall()
    for row in tasks:
        print(row)
except Exception as e:
    print('Tasks query error:', e)

# Check events/logs
print('\nRECENT LOGS:')
try:
    logs = cur.execute("SELECT * FROM events ORDER BY id DESC LIMIT 10;").fetchall()
    for row in logs:
        print(row)
except Exception as e:
    print('Logs query error:', e)
