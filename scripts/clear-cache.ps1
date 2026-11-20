<#
.SYNOPSIS
  Clears the Office web add-in cache (%LOCALAPPDATA%\Microsoft\Office\16.0\Wef\) so PowerPoint
  loads the newest add-in files and manifest. Office apps must be closed.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/clear-cache.ps1
#>
param([switch]$Force)
$ErrorActionPreference = 'Stop'
$running = @(Get-Process -Name POWERPNT, WINWORD, EXCEL, OUTLOOK, ONENOTE -ErrorAction SilentlyContinue)
if ($running.Count -and -not $Force) {
  Write-Warning ("Bitte zuerst schliessen: " + (($running | Select-Object -ExpandProperty ProcessName -Unique) -join ', '))
  exit 1
}
$wef = Join-Path $env:LOCALAPPDATA 'Microsoft\Office\16.0\Wef'
if (-not (Test-Path $wef)) { Write-Host "Kein Cache vorhanden ($wef)."; return }
$items = Get-ChildItem -Force $wef
$failed = 0
foreach ($i in $items) {
  try { Remove-Item -Recurse -Force $i.FullName -ErrorAction Stop } catch { $failed++ }
}
Write-Host ("Office-Add-in-Cache geleert: {0} Eintraege entfernt{1}." -f ($items.Count - $failed), $(if ($failed) { ", $failed gesperrt" } else { '' }))
Write-Host 'Beim naechsten Start laedt PowerPoint das Add-in neu von GitHub Pages.'
