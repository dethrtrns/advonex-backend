# start-dev.ps1

Write-Host "🔄 Starting Docker containers..."
docker compose up

Start-Sleep -Seconds 10  # optional buffer before tunnel runs

Write-Host "🌐 Starting Cloudflare Tunnel..."
Start-Process -NoNewWindow -FilePath "cloudflared" -ArgumentList "tunnel run advonex-api-tunnel"

