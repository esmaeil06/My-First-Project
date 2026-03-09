$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "Server started on port $port. Access at http://localhost:$port"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = $request.Url.LocalPath
    if ($localPath -eq "/") { $localPath = "/index.html" }
    $filePath = Join-Path (Get-Location) $localPath.TrimStart("/")

    if (Test-Path $filePath -PathType Leaf) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $response.ContentType = if ($filePath.EndsWith(".html")) { "text/html; charset=utf-8" } elseif ($filePath.EndsWith(".css")) { "text/css" } elseif ($filePath.EndsWith(".js")) { "application/javascript" } else { "text/plain" }
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
    } else {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("File not found")
    }

    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.OutputStream.Close()
}

$listener.Stop()