<#
.SYNOPSIS
  Creates the two target presentations for the self test via COM (Windows PowerShell 5.1):
   - "ion":    Office theme "Ion" (strong colors, Century Gothic)
   - "custom": own theme with deliberately different colors (orange/green/purple) and fonts (Georgia / Verdana)
  Writes <OutDir>\target-<name>.pptx and <OutDir>\target-<name>.json (theme colors, fonts, layouts).
#>
param([Parameter(Mandatory = $true)][string]$OutDir)
$ErrorActionPreference = 'Stop'
$msoTrue = -1; $msoFalse = 0; $ppSaveAsOpenXMLPresentation = 24
$themes = 'C:\Program Files\Microsoft Office\root\Document Themes 16'

function Rgb([int]$r, [int]$g, [int]$b) { return $r + 256 * $g + 65536 * $b }

function Get-ThemeInfo($pres) {
  $design = $pres.Designs.Item(1)
  $theme = $design.SlideMaster.Theme
  $colors = @()
  for ($i = 1; $i -le 12; $i++) { $colors += $theme.ThemeColorScheme.Colors($i).RGB }
  $layouts = @()
  foreach ($l in $design.SlideMaster.CustomLayouts) { $layouts += $l.Name }
  return [ordered]@{
    designs     = $pres.Designs.Count
    designName  = $design.Name
    colors      = $colors
    majorFont   = $theme.ThemeFontScheme.MajorFont.Item(1).Name
    minorFont   = $theme.ThemeFontScheme.MinorFont.Item(1).Name
    layouts     = $layouts
    slideCount  = $pres.Slides.Count
  }
}

function Add-SampleSlides($pres) {
  $master = $pres.Designs.Item(1).SlideMaster
  $title = $pres.Slides.AddSlide(1, $master.CustomLayouts.Item(1))
  $title.Shapes.Item(1).TextFrame.TextRange.Text = 'Selbsttest Zielpraesentation'
  if ($title.Shapes.Count -ge 2) { $title.Shapes.Item(2).TextFrame.TextRange.Text = 'Folie 1 - hinter dieser Folie wird eingefuegt' }
  $content = $pres.Slides.AddSlide(2, $master.CustomLayouts.Item(2))
  $content.Shapes.Item(1).TextFrame.TextRange.Text = 'Bestehende Inhaltsfolie'
  if ($content.Shapes.Count -ge 2) { $content.Shapes.Item(2).TextFrame.TextRange.Text = "Punkt A`rPunkt B" }
}

$app = New-Object -ComObject PowerPoint.Application
$hadOpen = $app.Presentations.Count -gt 0
try {
  # --- Ion ---
  $p = $app.Presentations.Add($msoFalse)
  $p.PageSetup.SlideWidth = 960; $p.PageSetup.SlideHeight = 540
  $p.ApplyTheme((Join-Path $themes 'Ion.thmx'))
  Add-SampleSlides $p
  $file = Join-Path $OutDir 'target-ion.pptx'
  $p.SaveAs($file, $ppSaveAsOpenXMLPresentation)
  (Get-ThemeInfo $p | ConvertTo-Json -Depth 4) | Set-Content -Encoding UTF8 (Join-Path $OutDir 'target-ion.json')
  $p.Close()

  # --- custom theme ---
  $p = $app.Presentations.Add($msoFalse)
  $p.PageSetup.SlideWidth = 960; $p.PageSetup.SlideHeight = 540
  $theme = $p.Designs.Item(1).SlideMaster.Theme
  $scheme = $theme.ThemeColorScheme
  $scheme.Colors(1).RGB = (Rgb 33 33 33)      # dark1
  $scheme.Colors(2).RGB = (Rgb 255 255 255)   # light1
  $scheme.Colors(3).RGB = (Rgb 92 45 145)     # dark2  purple
  $scheme.Colors(4).RGB = (Rgb 250 240 230)   # light2 warm
  $scheme.Colors(5).RGB = (Rgb 230 81 0)      # accent1 orange
  $scheme.Colors(6).RGB = (Rgb 46 125 50)     # accent2 green
  $scheme.Colors(7).RGB = (Rgb 142 36 170)    # accent3 purple
  $scheme.Colors(8).RGB = (Rgb 255 179 0)     # accent4 amber
  $scheme.Colors(9).RGB = (Rgb 0 131 143)     # accent5 teal
  $scheme.Colors(10).RGB = (Rgb 216 27 96)    # accent6 pink
  $scheme.Colors(11).RGB = (Rgb 230 81 0)
  $scheme.Colors(12).RGB = (Rgb 142 36 170)
  $theme.ThemeFontScheme.MajorFont.Item(1).Name = 'Georgia'
  $theme.ThemeFontScheme.MinorFont.Item(1).Name = 'Verdana'
  $p.Designs.Item(1).Name = 'Selbsttest Eigenes Theme'
  Add-SampleSlides $p
  $file = Join-Path $OutDir 'target-custom.pptx'
  $p.SaveAs($file, $ppSaveAsOpenXMLPresentation)
  (Get-ThemeInfo $p | ConvertTo-Json -Depth 4) | Set-Content -Encoding UTF8 (Join-Path $OutDir 'target-custom.json')
  $p.Close()

  # --- empty presentation (edge cases: insert into 0 slides, keep source formatting) ---
  $p = $app.Presentations.Add($msoFalse)
  $p.PageSetup.SlideWidth = 960; $p.PageSetup.SlideHeight = 540
  while ($p.Slides.Count -gt 0) { $p.Slides.Item(1).Delete() }
  $file = Join-Path $OutDir 'target-empty.pptx'
  $p.SaveAs($file, $ppSaveAsOpenXMLPresentation)
  (Get-ThemeInfo $p | ConvertTo-Json -Depth 4) | Set-Content -Encoding UTF8 (Join-Path $OutDir 'target-empty.json')
  $p.Close()
}
finally {
  if (-not $hadOpen -and $app.Presentations.Count -eq 0) { $app.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}
Write-Host "Testpraesentationen erstellt in $OutDir"
