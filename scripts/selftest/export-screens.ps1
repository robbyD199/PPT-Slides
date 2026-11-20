<#
.SYNOPSIS
  Screenshot comparison for the self test (Windows PowerShell 5.1, COM + System.Drawing).
  Exports every inserted slide from the result decks as PNG and builds comparison sheets:
     Vorlage (library preview) | Ziel 1 (e.g. Ion) | Ziel 2 (own theme)
  plus one image per target showing its slide master / layouts for reference.
  Output: test-results\screens\compare-NN.jpg, test-results\screens\<deck>\*.png
#>
param(
  [Parameter(Mandatory = $true)][string]$RunIds,       # comma separated, e.g. 20261120-031645-ion,20261120-031645-custom
  [string]$OutDir = '',
  [int]$PerSheet = 8,
  [string]$Prefix = 'compare'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $OutDir) { $OutDir = Join-Path $root 'test-results' }
$utf8 = New-Object Text.UTF8Encoding $false
$lib = [IO.File]::ReadAllText((Join-Path $root 'assets\library\library.json'), $utf8) | ConvertFrom-Json
$screens = Join-Path $OutDir 'screens'
New-Item -ItemType Directory -Force $screens | Out-Null
$msoTrue = -1; $msoFalse = 0

$app = New-Object -ComObject PowerPoint.Application
$hadOpen = $app.Presentations.Count -gt 0
$decks = @()
try {
  foreach ($runId in ($RunIds -split ',')) {
    $name = $runId -replace '^\d{8}-\d{6}-', ''
    $res = [IO.File]::ReadAllText((Join-Path $OutDir "selftest-$runId.json"), $utf8) | ConvertFrom-Json
    $deckFile = Join-Path $OutDir "result-$name.pptx"
    $dir = Join-Path $screens $name
    New-Item -ItemType Directory -Force $dir | Out-Null
    Get-ChildItem $dir -Filter *.png -ErrorAction SilentlyContinue | Remove-Item
    $p = $app.Presentations.Open($deckFile, $msoTrue, $msoFalse, $msoFalse)
    try {
      $map = @{}
      foreach ($r in $res.results) {
        if (-not $r.ok) { continue }
        $sid = [int64](($r.newSlideIds[0] -split '#')[0])
        $slide = $p.Slides.FindBySlideID($sid)
        $file = Join-Path $dir (($r.key -replace '[^\w]', '_') + '.png')
        $slide.Export($file, 'PNG', 960, 540)
        $map[$r.key] = $file
      }
      # reference: the target's own first slide (= its master/title layout look)
      $p.Slides.Item(1).Export((Join-Path $dir '_target-slide1.png'), 'PNG', 960, 540)
      $designName = $p.Designs.Item(1).Name
    } finally { $p.Close() }
    $decks += [pscustomobject]@{ name = $name; design = $designName; map = $map }
  }
} finally {
  if (-not $hadOpen -and $app.Presentations.Count -eq 0) { $app.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}

# --- comparison sheets -------------------------------------------------------------------------
$cellW = 480; $cellH = 270; $pad = 12; $labelH = 26; $headH = 34
$cols = 1 + $decks.Count
$fontHead = New-Object Drawing.Font('Segoe UI', 13, [Drawing.FontStyle]::Bold)
$font = New-Object Drawing.Font('Segoe UI', 11)
$black = [Drawing.Brushes]::Black; $grey = New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(110, 110, 110))
$pen = New-Object Drawing.Pen([Drawing.Color]::FromArgb(200, 200, 200), 1)
$entries = @($lib.slides | Sort-Object { if ($_.kind -eq 'layout') { 1000 + $_.position } else { $_.position } })
$sheet = 0
for ($start = 0; $start -lt $entries.Count; $start += $PerSheet) {
  $sheet++
  $chunk = $entries[$start..([Math]::Min($start + $PerSheet, $entries.Count) - 1)]
  $W = $pad + $cols * ($cellW + $pad)
  $H = $headH + $chunk.Count * ($cellH + $labelH + $pad) + $pad
  $bmp = New-Object Drawing.Bitmap($W, $H)
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.Clear([Drawing.Color]::White)
  $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $heads = @('Vorlage (Bibliothek)') + @($decks | ForEach-Object { "Ziel: $($_.design)" })
  for ($c = 0; $c -lt $cols; $c++) { $g.DrawString($heads[$c], $fontHead, $black, $pad + $c * ($cellW + $pad), 8) }
  $y = $headH
  foreach ($e in $chunk) {
    $g.DrawString(("#{0}  {1}   [{2}]" -f $e.position, $e.title, $e.lint.level), $font, $black, $pad, $y + 3)
    $y += $labelH
    $imgs = @((Join-Path $root "assets\library\$($e.preview)")) + @($decks | ForEach-Object { $_.map[$e.key] })
    for ($c = 0; $c -lt $cols; $c++) {
      $x = $pad + $c * ($cellW + $pad)
      if ($imgs[$c] -and (Test-Path $imgs[$c])) {
        $im = [Drawing.Image]::FromFile($imgs[$c])
        $g.DrawImage($im, $x, $y, $cellW, $cellH)
        $im.Dispose()
      } else { $g.DrawString('fehlt', $font, $grey, $x + 10, $y + 10) }
      $g.DrawRectangle($pen, $x, $y, $cellW - 1, $cellH - 1)
    }
    $y += $cellH + $pad
  }
  $file = Join-Path $screens ("{0}-{1:00}.jpg" -f $Prefix, $sheet)
  $codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]84)
  $bmp.Save($file, $codec, $ep)
  $g.Dispose(); $bmp.Dispose()
  Write-Host $file
}
