<#
.SYNOPSIS
  Writes a contrast-corrected COPY of the template (Windows PowerShell 5.1, COM). The source file is not changed.
.DESCRIPTION
  Takes the issues found by contrast-check.ps1 (deck "jp-morgan" = the template in its own color set) and fixes
  them with THEME colors so the result works in every color set:
    - text on dark fills      -> Background 1 (white)
    - light grey hint text    -> Text 2
    - other text on light     -> Text 1 (darkened 50 % if still below 3:1, e.g. on fixed signal colors)
    - SVG icons on dark fills -> graphics fill Background 1
.EXAMPLE
  powershell -File scripts/fix-contrast.ps1 -Issues test-results\contrast.json -Out templates\Library.kontrastfix.pptx
#>
param(
  [string]$Source = '',
  [Parameter(Mandatory = $true)][string]$Issues,
  [Parameter(Mandatory = $true)][string]$Out,
  [string]$Deck = 'jp-morgan'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $Source) { $Source = Join-Path $root 'templates\Library.pptx' }
$msoTrue = -1; $msoFalse = 0
$TEXT1 = 13; $BG1 = 14; $TEXT2 = 15

function Get-LumHex([string]$hex) {
  $h = $hex.TrimStart('#')
  $c = @([Convert]::ToInt32($h.Substring(0, 2), 16), [Convert]::ToInt32($h.Substring(2, 2), 16), [Convert]::ToInt32($h.Substring(4, 2), 16)) | ForEach-Object {
    $v = $_ / 255.0; if ($v -le 0.03928) { $v / 12.92 } else { [Math]::Pow(($v + 0.055) / 1.055, 2.4) } }
  return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2]
}

# all shapes with this name (names are not unique on every slide)
function Find-Shapes($shapes, [string]$name, $acc) {
  foreach ($s in $shapes) {
    if ($s.Name -eq $name) { [void]$acc.Add($s) }
    if ($s.Type -eq 6) { Find-Shapes $s.GroupItems $name $acc }
  }
}

$all = Get-Content -Raw -Encoding UTF8 $Issues | ConvertFrom-Json
# issues of several color sets, each place fixed once
$seen = @{}; $list = @()
foreach ($d in ($Deck -split ',')) {
  foreach ($i in @(($all | Where-Object { $_.deck -eq $d.Trim() }).issues)) {
    $k = "$($i.slide)|$($i.shape)|$($i.sample)"
    if (-not $seen.ContainsKey($k)) { $seen[$k] = 1; $list += $i }
  }
}
Copy-Item $Source $Out -Force
$app = New-Object -ComObject PowerPoint.Application
$hadOpen = $app.Presentations.Count -gt 0
$log = @()
try {
  $p = $app.Presentations.Open((Resolve-Path $Out).Path, $msoFalse, $msoFalse, $msoFalse)
  try {
    foreach ($i in $list) {
      $slide = $p.Slides.Item([int]$i.slide)
      $shapeName = $i.shape; $cell = $null
      if ($shapeName -match '^(.*) \[(\d+),(\d+)\]$') { $shapeName = $Matches[1]; $cell = @([int]$Matches[2], [int]$Matches[3]) }
      $found = New-Object System.Collections.ArrayList
      Find-Shapes $slide.Shapes $shapeName $found
      if (-not $found.Count) { $log += "Folie $($i.slide): '$($i.shape)' nicht gefunden"; continue }
      foreach ($sh in $found) {
      if ($i.kind -eq 'Symbol' -and $null -ne $i.x -and ([Math]::Abs($sh.Left - $i.x) -gt 1 -or [Math]::Abs($sh.Top - $i.y) -gt 1)) { continue }
      if ($i.kind -ne 'Symbol' -and -not $cell) { try { if (-not $sh.TextFrame2.TextRange.Text.Contains($i.sample)) { continue } } catch { continue } }
      $bgDark = (Get-LumHex $i.bg) -lt 0.3
      if ($i.kind -eq 'Symbol') {
        $sh.Fill.Visible = $msoTrue
        $sh.Fill.ForeColor.ObjectThemeColor = $(if ($bgDark) { $BG1 } else { $TEXT1 })
        $log += "Folie $($i.slide): Symbol '$($i.shape)' -> $(if ($bgDark) { 'Hintergrund 1' } else { 'Text 1' })"
        continue
      }
      $tf = if ($cell) { $sh.Table.Cell($cell[0], $cell[1]).Shape.TextFrame2 } else { $sh.TextFrame2 }
      # light grey hints and light (de-emphasized) accent text keep a subdued look: Text 2
      $isGreyHint = (($i.fg -eq '#A6A6A6' -or $i.fg -eq '#BFBFBF' -or $i.fg -eq '#7F7F7F') -or ((Get-LumHex $i.fg) -gt 0.3 -and $i.fg -ne '#FFFFFF')) -and -not $bgDark
      $target = if ($bgDark) { $BG1 } elseif ($isGreyHint) { $TEXT2 } else { $TEXT1 }
      foreach ($run in $tf.TextRange.Runs()) {
        if (-not $run.Text.Trim()) { continue }
        $run.Font.Fill.ForeColor.ObjectThemeColor = $target
        # fixed (non-theme) light backgrounds such as signal colors: darken Text 1 for color sets with a light Text 1
        if ($target -eq $TEXT1 -and $i.ratio -lt 3) { $run.Font.Fill.ForeColor.Brightness = -0.5 }
      }
      $log += "Folie $($i.slide): Text '$($i.sample)' ($($i.fg) auf $($i.bg)) -> $(switch ($target) { 13 { 'Text 1' } 14 { 'Hintergrund 1' } 15 { 'Text 2' } })"
      }
    }
    $p.Save()
  } finally { $p.Close() }
} finally {
  if (-not $hadOpen -and $app.Presentations.Count -eq 0) { $app.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
$log | ForEach-Object { Write-Host $_ }
Write-Host ("{0} Korrekturen in {1}" -f $log.Count, $Out)
