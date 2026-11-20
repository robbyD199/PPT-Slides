<#
.SYNOPSIS
  Plan B (e.g. university account): provide the add-in through a shared-folder add-in catalog.
.DESCRIPTION
  1. Creates a local folder and copies the production manifest into it.
  2. With -CreateShare (ADMIN rights required): shares the folder as \\<computer>\Folienbibliothek
     (read access for the current user only).
  3. Registers the share as trusted add-in catalog for this Windows user:
     HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{GUID}  (Id, Url = UNC path, Flags = 1)
  4. Reports Office add-in policies (HKCU/HKLM ...\Policies\Microsoft\Office\16.0\WEF and \Common)
     that may block the catalog. Policies are reported, never changed.
  Afterwards in PowerPoint: Home -> Add-ins -> More Add-ins -> SHARED FOLDER -> Folienbibliothek.
  -Uninstall removes the catalog entry (the share is removed with -CreateShare -Uninstall, admin).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/install-catalog.ps1 -CheckOnly
  # as administrator:
  powershell -ExecutionPolicy Bypass -File scripts/install-catalog.ps1 -CreateShare
#>
param(
  [string]$Folder = 'C:\Folienbibliothek-Katalog',
  [string]$ShareName = 'Folienbibliothek',
  [switch]$CreateShare,
  [switch]$CheckOnly,
  [switch]$Uninstall
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$catKey = 'HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs'
$unc = "\\$env:COMPUTERNAME\$ShareName"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

function Show-Policies {
  Write-Host '--- Office-Richtlinien fuer Add-ins ---'
  $found = $false
  foreach ($k in @('HKCU:\Software\Policies\Microsoft\Office\16.0\WEF', 'HKLM:\Software\Policies\Microsoft\Office\16.0\WEF',
                   'HKCU:\Software\Policies\Microsoft\Office\16.0\Common', 'HKLM:\Software\Policies\Microsoft\Office\16.0\Common')) {
    if (Test-Path $k) {
      Get-ChildItem $k -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
        foreach ($prop in $p.PSObject.Properties) { if ($prop.Name -notlike 'PS*') { Write-Host ("  {0}\{1} = {2}" -f $_.Name, $prop.Name, $prop.Value); $found = $true } }
      }
      $p = Get-ItemProperty $k -ErrorAction SilentlyContinue
      foreach ($prop in $p.PSObject.Properties) { if ($prop.Name -notlike 'PS*') { Write-Host ("  {0}\{1} = {2}" -f $k, $prop.Name, $prop.Value); $found = $true } }
    }
  }
  if (-not $found) { Write-Host '  Keine lokalen Office-Add-in-Richtlinien gefunden (Cloud-Richtlinien der Organisation wirken erst nach Anmeldung mit dem Organisationskonto).' }
}

Show-Policies
if ($CheckOnly) { return }

if ($Uninstall) {
  if (Test-Path $catKey) {
    Get-ChildItem $catKey | Where-Object { (Get-ItemProperty $_.PSPath).Url -eq $unc } | ForEach-Object { Remove-Item $_.PSPath -Recurse; Write-Host "Katalog entfernt: $unc" }
  }
  if ($CreateShare) {
    if (-not $isAdmin) { throw 'Zum Entfernen der Freigabe sind Administratorrechte noetig.' }
    if (Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue) { Remove-SmbShare -Name $ShareName -Force; Write-Host "Freigabe entfernt: $ShareName" }
  }
  return
}

New-Item -ItemType Directory -Force $Folder | Out-Null
Copy-Item (Join-Path $root 'manifest.xml') (Join-Path $Folder 'manifest.xml') -Force
Write-Host "Manifest kopiert nach $Folder"

if ($CreateShare) {
  if (-not $isAdmin) { throw 'Freigabe anlegen braucht Administratorrechte: PowerShell als Administrator starten.' }
  if (-not (Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue)) {
    New-SmbShare -Name $ShareName -Path $Folder -ReadAccess "$env:USERDOMAIN\$env:USERNAME" | Out-Null
    Write-Host "Freigabe angelegt: $unc"
  }
}
if (-not (Test-Path $unc)) {
  Write-Warning "Freigabe $unc ist nicht erreichbar. Mit -CreateShare (als Administrator) anlegen."
  return
}

New-Item -Path $catKey -Force | Out-Null
$existing = Get-ChildItem $catKey -ErrorAction SilentlyContinue | Where-Object { (Get-ItemProperty $_.PSPath).Url -eq $unc }
if (-not $existing) {
  $guid = '{' + [guid]::NewGuid().ToString() + '}'
  $k = New-Item -Path (Join-Path $catKey $guid) -Force
  New-ItemProperty -Path $k.PSPath -Name 'Id' -Value $guid -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $k.PSPath -Name 'Url' -Value $unc -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $k.PSPath -Name 'Flags' -Value 1 -PropertyType DWord -Force | Out-Null
  Write-Host "Vertrauenswuerdiger Katalog eingetragen: $unc"
} else {
  Write-Host "Katalog ist bereits eingetragen: $unc"
}
Write-Host 'PowerPoint neu starten -> Start -> Add-ins -> Weitere Add-ins -> FREIGEGEBENER ORDNER -> Folienbibliothek -> Hinzufuegen.'
