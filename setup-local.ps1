$ErrorActionPreference = "Stop"
$Target = "F:\Projects\Websites\mehfil-e-zaika"
$Repo = "https://github.com/saweraad84/mr-feast.git"
$Branch = "mehfil-e-zaika"
$RepoZip = "https://github.com/saweraad84/mr-feast/archive/refs/heads/mehfil-e-zaika.zip"
$TempRoot = Join-Path $env:TEMP ("mehfil-e-zaika-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $Target | Out-Null
$existing = @(Get-ChildItem -Force -Path $Target -ErrorAction SilentlyContinue)
if ($existing.Count -gt 0) { throw "Target folder is not empty: $Target. No files were changed." }
$git = Get-Command git -ErrorAction SilentlyContinue
if ($git) {
  git clone --branch $Branch --single-branch $Repo $Target
  if ($LASTEXITCODE -ne 0) { throw "Git clone failed." }
} else {
  $ZipFile = Join-Path $TempRoot "mehfil-e-zaika.zip"
  $ExtractDir = Join-Path $TempRoot "extract"
  New-Item -ItemType Directory -Force -Path $TempRoot, $ExtractDir | Out-Null
  Invoke-WebRequest -Uri $RepoZip -OutFile $ZipFile -UseBasicParsing
  Expand-Archive -Path $ZipFile -DestinationPath $ExtractDir -Force
  $Source = Get-ChildItem -Directory -Path $ExtractDir | Select-Object -First 1
  if (-not $Source) { throw "Could not find extracted project folder." }
  Copy-Item -Path (Join-Path $Source.FullName "*") -Destination $Target -Recurse -Force
  Remove-Item -Path $TempRoot -Recurse -Force
}
$serverFile = Join-Path $Target "server.js"
if (Test-Path $serverFile) {
  $server = Get-Content $serverFile -Raw
  $server = $server.Replace("const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'MrFeast2026!';", "const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'';")
  $server = $server.Replace("const SITE_NAME=process.env.SITE_NAME||'Mr. Feast';", "const SITE_NAME=process.env.SITE_NAME||'Mehfil-e-Zaika';")
  Set-Content -Path $serverFile -Value $server -Encoding UTF8
}
$packageFile = Join-Path $Target "package.json"
$indexFile = Join-Path $Target "public\index.html"
if (-not (Test-Path $packageFile)) { throw "Validation failed: package.json missing." }
if (-not (Test-Path $serverFile)) { throw "Validation failed: server.js missing." }
if (-not (Test-Path $indexFile)) { throw "Validation failed: public\index.html missing." }
$packageText = Get-Content $packageFile -Raw
$indexText = Get-Content $indexFile -Raw
if ($packageText -notmatch '"name"\s*:\s*"mehfil-e-zaika"') { throw "Validation failed: wrong package." }
if ($indexText -notmatch 'MEHFIL-E-ZAIKA') { throw "Validation failed: Mehfil branding missing." }
$bad = Get-ChildItem -Path $Target -Recurse -File | Where-Object { $_.Extension -in ".js",".html",".css",".md",".json",".txt" } | Select-String -Pattern "Mr\. Feast|Mr Feast|MrFeast|Awais BBQ" -ErrorAction SilentlyContinue
if ($bad) { $bad | ForEach-Object { Write-Host ($_.Path + ":" + $_.LineNumber + " " + $_.Line.Trim()) }; throw "Cross-project validation failed." }
Write-Host "DONE: $Target" -ForegroundColor Green
Get-ChildItem -Path $Target
