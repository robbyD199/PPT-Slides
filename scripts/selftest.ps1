<#
.SYNOPSIS
  Automated end-to-end self test of the slide library add-in (DEV build) in PowerPoint desktop.
.DESCRIPTION
  1. Starts the dev server (https://localhost:3000) with a throw-away self-signed certificate.
  2. Registers manifest.dev.xml for sideloading (HKCU\...\WEF\Developer).
  3. Creates test presentations via COM: theme "Ion", an own theme (Georgia/Verdana, orange/green
     palette) and an empty presentation.
  4. Adds an auto-opening task pane + the setting "slidelib.selftest" to each deck and opens it in a
     dedicated PowerPoint instance. The dev-only self-test mode inserts every library slide after
     slide 1 and reports to the dev server (test-results\selftest-<run>.json).
  5. Verifies every inserted slide via COM (position, selection, time, master/design, theme colors,
     theme fonts, no extra masters, layout mapping) and writes test-results\report.md.
  The test PowerPoint instance is started with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=
  --ignore-certificate-errors (only for this process) so no certificate has to be installed.
  PowerPoint must be closed before starting.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/selftest.ps1
#>
param(
  [int]$TimeoutSec = 600,
  [switch]$KeepServer
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'test-results'
New-Item -ItemType Directory -Force $out | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$ppt = 'C:\Program Files\Microsoft Office\root\Office16\POWERPNT.EXE'
$manifest = Join-Path $root 'manifest.dev.xml'
$devId = ([xml](Get-Content -Raw $manifest)).OfficeApp.Id
$lib = Join-Path $root 'assets\library\library.json'

# --- 0. PowerPoint must not run (a new instance is started for the test) ----------------------
foreach ($x in @(Get-CimInstance Win32_Process -Filter "Name='POWERPNT.EXE'")) {
  if ($x.CommandLine -match '/AUTOMATION') { Stop-Process -Id $x.ProcessId -Force; Start-Sleep 2 }
  else { throw 'Bitte PowerPoint vollstaendig schliessen und den Selbsttest erneut starten.' }
}

# --- 1. dev server ---------------------------------------------------------------------------------
add-type @"
using System.Net; using System.Security.Cryptography.X509Certificates;
public class SlidelibTrustAll : ICertificatePolicy { public bool CheckValidationResult(ServicePoint s, X509Certificate c, WebRequest r, int p) { return true; } }
"@
[Net.ServicePointManager]::CertificatePolicy = New-Object SlidelibTrustAll
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
function Test-DevServer {
  try { return (Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 'https://localhost:3000/taskpane.html').StatusCode -eq 200 } catch { return $false }
}
$startedServer = $null
if (-not (Test-DevServer)) {
  Write-Host 'Starte Dev-Server (selbstsigniertes Zertifikat) ...'
  $log = Join-Path $out 'devserver.log'
  $startedServer = Start-Process -FilePath 'cmd.exe' -WorkingDirectory $root -WindowStyle Hidden -PassThru `
    -ArgumentList '/c', "set SLIDELIB_SELFSIGNED=1&& npx webpack serve --mode development > `"$log`" 2>&1"
  $deadline = (Get-Date).AddSeconds(120)
  while (-not (Test-DevServer)) {
    if ((Get-Date) -gt $deadline) { throw "Dev-Server startet nicht (siehe $log)." }
    Start-Sleep 3
  }
}
Write-Host 'Dev-Server laeuft: https://localhost:3000'

# --- 2. sideload dev manifest ------------------------------------------------------------------
$devKey = 'HKCU:\Software\Microsoft\Office\16.0\WEF\Developer'
$devWasRegistered = (Test-Path $devKey) -and ((Get-ItemProperty $devKey).PSObject.Properties.Name -contains $devId)
New-Item -Path $devKey -Force | Out-Null
Set-ItemProperty -Path $devKey -Name $devId -Value $manifest

# --- 3. test decks -----------------------------------------------------------------------------
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'selftest\new-test-decks.ps1') -OutDir $out
if ($LASTEXITCODE -ne 0) { throw 'Testpraesentationen konnten nicht erstellt werden.' }
Start-Sleep 3
foreach ($x in @(Get-CimInstance Win32_Process -Filter "Name='POWERPNT.EXE'")) { if ($x.CommandLine -match '/AUTOMATION') { Stop-Process -Id $x.ProcessId -Force } }

# --- 4. runs -----------------------------------------------------------------------------------
$runs = @(
  @{ name = 'ion'; mode = 'full' },
  @{ name = 'custom'; mode = 'full' },
  @{ name = 'empty'; mode = 'empty' }
)
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--ignore-certificate-errors'
$runIds = @()
foreach ($r in $runs) {
  $runId = "$stamp-$($r.name)"
  $runIds += $runId
  $deck = Join-Path $out "run-$runId.pptx"
  & node (Join-Path $PSScriptRoot 'lib\webextension.js') (Join-Path $out "target-$($r.name).pptx") $deck $devId '1.0.0.0' "slidelib.selftest=$runId" "slidelib.selftest.mode=$($r.mode)"
  if ($LASTEXITCODE -ne 0) { throw 'Web-Extension konnte nicht eingefuegt werden.' }
  $resultFile = Join-Path $out "selftest-$runId.json"
  Write-Host "[$($r.name)] PowerPoint startet, Selbsttest laeuft ..."
  $pptProc = Start-Process -FilePath $ppt -ArgumentList "`"$deck`"" -PassThru
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while (-not (Test-Path $resultFile)) {
    if ((Get-Date) -gt $deadline) { throw "[$($r.name)] Kein Ergebnis nach $TimeoutSec s. Laeuft das Add-in? (Dev-Server-Log: $out\devserver.log)" }
    Start-Sleep 3
  }
  Start-Sleep 2
  $verify = if ($r.mode -eq 'empty') { 'verify-empty.ps1' } else { 'verify-deck.ps1' }
  $vArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot "selftest\$verify"),
    '-DeckPath', $deck, '-ResultJson', $resultFile, '-TargetJson', (Join-Path $out "target-$($r.name).json"),
    '-SaveAs', (Join-Path $out "result-$($r.name).pptx"), '-Quit')
  if ($r.mode -ne 'empty') { $vArgs += @('-LibraryJson', $lib) }
  & powershell.exe @vArgs
  if ($LASTEXITCODE -ne 0) { throw "[$($r.name)] COM-Pruefung fehlgeschlagen." }
  # wait until the test instance (started above, PowerPoint was not running before) has exited
  $deadline = (Get-Date).AddSeconds(45)
  while (-not $pptProc.HasExited) {
    if ((Get-Date) -gt $deadline) { Write-Warning "PowerPoint-Testinstanz $($pptProc.Id) beendet sich nicht - wird beendet."; Stop-Process -Id $pptProc.Id -Force; break }
    Start-Sleep 2
  }
}
Remove-Item Env:\WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS

# --- 5. screenshots: library preview vs. inserted slide in each target -------------------------
$fullRuns = @($runIds | Where-Object { $_ -notmatch '-empty$' }) -join ','
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'selftest\export-screens.ps1') -RunIds $fullRuns -OutDir $out
if ($LASTEXITCODE -ne 0) { Write-Warning 'Screenshot-Vergleich fehlgeschlagen.' }

# --- 6. report ---------------------------------------------------------------------------------
& node (Join-Path $PSScriptRoot 'selftest\report.js') --out (Join-Path $out 'report.md') --lib $lib @($runIds | ForEach-Object { '--run'; $_ })
if ($LASTEXITCODE -ne 0) { throw 'Bericht konnte nicht erstellt werden.' }

if ($startedServer -and -not $KeepServer) {
  Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'webpack' -and $_.CommandLine -match 'serve' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
# remove the dev sideload again unless it was registered before (otherwise the ribbon shows a broken Dev group)
if (-not $devWasRegistered) { Remove-ItemProperty -Path $devKey -Name $devId -ErrorAction SilentlyContinue }
Write-Host "Bericht: $out\report.md"
