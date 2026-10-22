Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & WshShell.CurrentDirectory & "\license_server\server.js""", 0, False
WScript.Sleep 1000
WshShell.Run "http://localhost:8787/admin"
