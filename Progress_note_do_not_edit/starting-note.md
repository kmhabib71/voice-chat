cd /mnt/c/Users/WALTON/Desktop/MouseWithoutBorders/ai-companion-tested-2/ai-companion-tested/voicechat

netstat -ano | findstr :3002

taskkill /PID <PID> /F
Manual Kill Commands:
pkill node
PowerShell:

# Kill by port

Get-Process -Id (Get-NetTCPConnection
-LocalPort 3002).OwningProcess |
Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection
-LocalPort 3003).OwningProcess |
Stop-Process -Force

# Kill all Node.js processes

Get-Process | Where-Object {$\_.ProcessName  
 -eq 'node'} | Stop-Process -Force

Command Prompt:

# Kill by port

netstat -ano | findstr :3002
taskkill /PID [PID_NUMBER] /F

netstat -ano | findstr :3003
taskkill /PID [PID_NUMBER] /F

Both servers are now running cleanly via  
 PowerShell → Go to http://localhost:3003
