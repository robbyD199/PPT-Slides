<#
.SYNOPSIS
  Contrast check (Windows PowerShell 5.1, COM): measures the WCAG contrast ratio between text/icon colors
  and the color behind them on every visible slide of one or more decks (e.g. the library in each color set).
  Resolved colors come from PowerPoint itself, so theme colors are evaluated in the deck's color set.
  Writes <OutJson>; prints a summary. Text below 3:1 and icons below 2:1 are reported.
.EXAMPLE
  node scripts/lib/colorsets.js templates/Library.pptx test-results/colorsets
  powershell -File scripts/contrast-check.ps1 -Decks "test-results\colorsets\jp-morgan.pptx,test-results\colorsets\ubs.pptx" -OutJson test-results\contrast.json
#>
param(
  [Parameter(Mandatory = $true)][string]$Decks,
  [Parameter(Mandatory = $true)][string]$OutJson,
  [double]$TextMin = 3.0,
  [double]$IconMin = 2.0
)
$ErrorActionPreference = 'Stop'
$msoTrue = -1; $msoFalse = 0

function Get-Lum([int]$rgb) {
  $c = @(($rgb -band 0xFF), (($rgb -shr 8) -band 0xFF), (($rgb -shr 16) -band 0xFF)) | ForEach-Object {
    $v = $_ / 255.0; if ($v -le 0.03928) { $v / 12.92 } else { [Math]::Pow(($v + 0.055) / 1.055, 2.4) } }
  return 0.2126 * $c[0] + 0.7152 * $c[1] + 0.0722 * $c[2]
}
function Get-Ratio([int]$a, [int]$b) {
  $la = Get-Lum $a; $lb = Get-Lum $b
  return ([Math]::Max($la, $lb) + 0.05) / ([Math]::Min($la, $lb) + 0.05)
}
function Hex([int]$rgb) { return ('#{0:X2}{1:X2}{2:X2}' -f ($rgb -band 0xFF), (($rgb -shr 8) -band 0xFF), (($rgb -shr 16) -band 0xFF)) }

# flatten shapes (groups, keep z-order), with solid fill info
function Get-Flat($shapes, [double]$zBase, [double]$zScale, $acc) {
  $i = 0
  foreach ($sh in $shapes) {
    $i++
    $z = $zBase + $i * $zScale
    if ($sh.Type -eq 6) { Get-Flat $sh.GroupItems $z ($zScale / 1000) $acc; continue }
    $fill = $null
    try { if ($sh.Fill.Visible -eq $msoTrue -and $sh.Fill.Type -eq 1 -and $sh.Fill.Transparency -lt 0.5) { $fill = $sh.Fill.ForeColor.RGB } } catch { }
    # only shapes that fill their bounding box count as background (no triangles / freeforms)
    $rectish = $false
    try { $rectish = ($sh.Type -eq 1 -and @(1, 5, 9, 51, 52, 73) -contains $sh.AutoShapeType) -or ($sh.Type -eq 14) -or ($sh.Type -eq 17) } catch { }
    if (-not $rectish) { $fillAsBg = $null } else { $fillAsBg = $fill }
    $acc.Add([pscustomobject]@{ sh = $sh; z = $z; fill = $fill; bgFill = $fillAsBg; l = $sh.Left; t = $sh.Top; w = $sh.Width; h = $sh.Height; type = $sh.Type; name = $sh.Name }) | Out-Null
  }
}

# background = topmost filled shape below the item that contains its center and (for text) covers
# most of the item's box - a small circle next to a legend text is not its background
function Get-Behind($flat, $item, [int]$slideBg, [double]$minCover = 0, [switch]$AnyShape) {
  $cx = $item.l + $item.w / 2; $cy = $item.t + $item.h / 2
  $best = $null
  foreach ($o in $flat) {
    $cand = if ($AnyShape) { $o.fill } else { $o.bgFill }   # icons sit centered in circles (often freeforms)
    if ($o.z -ge $item.z -or $null -eq $cand) { continue }
    if ($o.type -eq 13 -or $o.type -eq 28) { continue }
    if ($minCover -gt 0 -and $item.w -gt 0 -and $item.h -gt 0) {
      $ix = [Math]::Max(0, [Math]::Min($item.l + $item.w, $o.l + $o.w) - [Math]::Max($item.l, $o.l))
      $iy = [Math]::Max(0, [Math]::Min($item.t + $item.h, $o.t + $o.h) - [Math]::Max($item.t, $o.t))
      if (($ix * $iy) / ($item.w * $item.h) -lt $minCover) { continue }
    }
    if ($cx -ge $o.l -and $cx -le ($o.l + $o.w) -and $cy -ge $o.t -and $cy -le ($o.t + $o.h)) {
      if (-not $best -or $o.z -gt $best.z) { $best = $o; $bestFill = $cand }
    }
  }
  if ($best) { return $bestFill } else { return $slideBg }
}

$app = New-Object -ComObject PowerPoint.Application
$hadOpen = $app.Presentations.Count -gt 0
$report = @()
try {
  foreach ($deck in ($Decks -split ',')) {
    $path = (Resolve-Path $deck.Trim()).Path
    $p = $app.Presentations.Open($path, $msoTrue, $msoFalse, $msoFalse)
    $issues = New-Object System.Collections.ArrayList
    try {
      foreach ($slide in $p.Slides) {
        if ($slide.SlideShowTransition.Hidden -eq $msoTrue) { continue }
        $title = ''; try { $title = $slide.Shapes.Title.TextFrame.TextRange.Text } catch { }
        $slideBg = $slide.ThemeColorScheme.Colors(2).RGB
        try { if ($slide.FollowMasterBackground -eq $msoFalse -and $slide.Background.Fill.Type -eq 1) { $slideBg = $slide.Background.Fill.ForeColor.RGB } } catch { }
        $flat = New-Object System.Collections.ArrayList
        Get-Flat $slide.Shapes 0 1 $flat
        foreach ($it in $flat) {
          $sh = $it.sh
          if ($it.l + $it.w -lt 0 -or $it.t + $it.h -lt 0 -or $it.l -gt $p.PageSetup.SlideWidth -or $it.t -gt $p.PageSetup.SlideHeight) { continue }
          # --- icons (SVG graphics / small pictures) ---
          if (($it.type -eq 28 -or $it.type -eq 13) -and $it.w -lt 80 -and $it.h -lt 80) {
            $bg = Get-Behind $flat $it $slideBg 0 -AnyShape
            $iconColor = $null; $assumed = $false
            if ($it.type -eq 28) {
              if ($null -ne $it.fill) { $iconColor = $it.fill } else { $iconColor = 0; $assumed = $true }
            }
            if ($null -ne $iconColor) {
              $r = Get-Ratio $iconColor $bg
              if ($r -lt $IconMin) {
                [void]$issues.Add([pscustomobject]@{ slide = $slide.SlideIndex; title = $title; shape = $it.name; kind = 'Symbol'; sample = $(if ($assumed) { '(SVG, Originalfarbe schwarz)' } else { '(SVG eingefaerbt)' }); fg = (Hex $iconColor); bg = (Hex $bg); ratio = [Math]::Round($r, 2); x = [Math]::Round($it.l, 1); y = [Math]::Round($it.t, 1) })
              }
            }
            continue
          }
          # --- text: tables ---
          $cells = @()
          try {
            if ($sh.HasTable -eq $msoTrue) {
              $tb = $sh.Table
              for ($r = 1; $r -le $tb.Rows.Count; $r++) { for ($c = 1; $c -le $tb.Columns.Count; $c++) {
                $cs = $tb.Cell($r, $c).Shape
                $cf = $null; try { if ($cs.Fill.Visible -eq $msoTrue -and $cs.Fill.Transparency -lt 0.5) { $cf = $cs.Fill.ForeColor.RGB } } catch { }
                $cells += [pscustomobject]@{ tf = $cs.TextFrame2; bg = $(if ($null -ne $cf) { $cf } else { Get-Behind $flat $it $slideBg }); name = "$($it.name) [$r,$c]" }
              } }
            } elseif ($sh.HasTextFrame -eq $msoTrue) {
              $cells += [pscustomobject]@{ tf = $sh.TextFrame2; bg = $(if ($null -ne $it.fill) { $it.fill } else { Get-Behind $flat $it $slideBg 0.6 }); name = $it.name }
            }
          } catch { }
          foreach ($cell in $cells) {
            try {
              if ($cell.tf.HasText -ne $msoTrue) { continue }
              $worst = $null
              foreach ($run in $cell.tf.TextRange.Runs()) {
                $txt = $run.Text.Trim(); if (-not $txt) { continue }
                $fc = $run.Font.Fill.ForeColor.RGB
                $r = Get-Ratio $fc $cell.bg
                if (-not $worst -or $r -lt $worst.r) { $worst = @{ r = $r; fc = $fc; txt = $txt } }
              }
              if ($worst -and $worst.r -lt $TextMin) {
                [void]$issues.Add([pscustomobject]@{ slide = $slide.SlideIndex; title = $title; shape = $cell.name; kind = 'Text'; sample = $worst.txt.Substring(0, [Math]::Min(40, $worst.txt.Length)); fg = (Hex $worst.fc); bg = (Hex $cell.bg); ratio = [Math]::Round($worst.r, 2) })
              }
            } catch { }
          }
        }
      }
    } finally { $p.Close() }
    $report += [pscustomobject]@{ deck = [IO.Path]::GetFileNameWithoutExtension($path); issues = @($issues) }
    Write-Host ("{0}: {1} Stellen mit zu wenig Kontrast ({2} Text, {3} Symbole)" -f [IO.Path]::GetFileNameWithoutExtension($path), $issues.Count, @($issues | Where-Object { $_.kind -eq 'Text' }).Count, @($issues | Where-Object { $_.kind -eq 'Symbol' }).Count)
  }
} finally {
  if (-not $hadOpen -and $app.Presentations.Count -eq 0) { $app.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
[IO.File]::WriteAllText($OutJson, ($report | ConvertTo-Json -Depth 6), (New-Object Text.UTF8Encoding $false))
