Write-Host "🌐 Starting Cloudflare Tunnel..."
Start-Process -NoNewWindow -FilePath "cloudflared" -ArgumentList "tunnel run advonex-api-tunnel"