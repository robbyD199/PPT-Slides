<#
.SYNOPSIS
  Plan A (private account): registers the Folienbibliothek add-in permanently for this Windows user.
.DESCRIPTION
  Copies the production manifest (GitHub Pages URLs) to %LOCALAPPDATA%\Folienbibliothek and registers
  it under HKCU\Software\Microsoft\Office\16.0\WEF\Developer (per user, no admin rights needed).
  After restarting PowerPoint the group "Folienbibliothek" appears on the Home tab.
  -Dev registers manifest.dev.xml (https://localhost:3000) instead.
  -Uninstall removes the registration (and the copied manifest).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/install-sideload.ps1
  powershell -ExecutionPolicy Bypass -File scripts/install-sideload.ps1 -Uninstall
#>
param(
  [switch]$Uninstall,
  [switch]$Dev,
  [string]$ManifestUrl = 'https://robbyd199.github.io/PPT-Slides/manifest.xml'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$devKey = 'HKCU:\Software\Microsoft\Office\16.0\WEF\Developer'
$target = Join-Path $env:LOCALAPPDATA 'Folienbibliothek'
$source = if ($Dev) { Join-Path $root 'manifest.dev.xml' } else { Join-Path $root 'manifest.xml' }

function Get-ManifestId([string]$path) { return ([xml](Get-Content -Raw -Encoding UTF8 $path)).OfficeApp.Id }

if ($Uninstall) {
  $removed = 0
  if (Test-Path $devKey) {
    foreach ($m in @((Join-Path $root 'manifest.xml'), (Join-Path $root 'manifest.dev.xml'), (Join-Path $target 'manifest.xml'))) {
      if (Test-Path $m) {
        $id = Get-ManifestId $m
        if ((Get-ItemProperty $devKey -ErrorAction SilentlyContinue).PSObject.Properties.Name -contains $id) {
          Remove-ItemProperty -Path $devKey -Name $id; $removed++
          Write-Host "Registrierung entfernt: $id"
        }
      }
    }
  }
  if (Test-Path $target) { Remove-Item -Recurse -Force $target }
  Write-Host ("Deinstalliert ({0} Eintraege). PowerPoint neu starten. Optional: scripts/clear-cache.ps1" -f $removed)
  return
}

New-Item -ItemType Directory -Force $target | Out-Null
$dest = Join-Path $target 'manifest.xml'
if ($Dev) {
  Copy-Item $source $dest -Force
} else {
  # prefer the deployed manifest (always matches what GitHub Pages serves); fall back to the repo copy
  try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -UseBasicParsing -Uri $ManifestUrl -OutFile $dest -TimeoutSec 20
    Write-Host "Manifest geladen: $ManifestUrl"
  } catch {
    Write-Warning "Manifest konnte nicht von GitHub Pages geladen werden ($($_.Exception.Message)) - verwende $source"
    Copy-Item $source $dest -Force
  }
}
$id = Get-ManifestId $dest
New-Item -Path $devKey -Force | Out-Null
Set-ItemProperty -Path $devKey -Name $id -Value $dest
Write-Host "Registriert: $id -> $dest"
Write-Host 'PowerPoint neu starten: Start -> Gruppe "Folienbibliothek" -> "Bibliothek" bzw. "Folie suchen".'
