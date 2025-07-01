# stop-dev.ps1

Write-Host "🛑 Stopping Docker containers..."
docker compose down

Write-Host "🛑 Attempting to stop Cloudflare Tunnel..."
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

