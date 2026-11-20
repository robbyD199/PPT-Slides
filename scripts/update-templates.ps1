<#
.SYNOPSIS
  Rebuilds the slide library from templates/Library.pptx.
.DESCRIPTION
  1. Reads slide IDs, creationIds, titles and text from the PPTX (node scripts/extract-cli.js).
  2. Opens the PPTX invisibly and read-only via COM and exports
       - thumbnails (480x270) and large previews (1280x720) per slide
       - one mini PPTX per slide (copy of the library, all other slides deleted, master kept)
       - one empty slide per master layout ("Grundlayouts")
       - a base template for "Neue Praesentation" (master + cover slide)
  3. Merges assets/library/library.json: known slides keep their category, deleted slides are
     removed, new slides get "category": null. Prints new / changed / deleted / lint / uncategorized.
  Must run in Windows PowerShell 5.1 (powershell.exe) because of COM.
  The source PPTX is never modified.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/update-templates.ps1
#>
param(
  [string]$Source = '',
  [switch]$SkipMini
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $Source) { $Source = Join-Path $root 'templates\Library.pptx' }
$Source = (Resolve-Path $Source).Path
$out = Join-Path $root 'assets\library'
$work = Join-Path $env:TEMP ('slidelib-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
$stage = Join-Path $work 'stage'
foreach ($d in @('thumbs', 'previews', 'slides', 'layouts', 'template')) {
  New-Item -ItemType Directory -Force -Path (Join-Path $stage $d) | Out-Null
}
$sw = [Diagnostics.Stopwatch]::StartNew()
Write-Host "Quelle: $Source"

# --- 1. Extract metadata (pure XML, no PowerPoint) -----------------------------------------
$extractFile = Join-Path $work 'extract.json'
& node (Join-Path $PSScriptRoot 'extract-cli.js') --source $Source --out $extractFile
if ($LASTEXITCODE -ne 0) { throw 'Extraktion fehlgeschlagen.' }
$ex = [IO.File]::ReadAllText($extractFile, [Text.Encoding]::UTF8) | ConvertFrom-Json
$wanted = @{}
foreach ($s in $ex.slides) { if (-not $s.hidden) { $wanted[[string]$s.slideId] = $s } }
Write-Host ("{0} Folien in der Datei, {1} sichtbare Bibliotheksfolien (ausgeblendete Folien werden ignoriert)." -f $ex.slides.Count, $wanted.Count)

# --- 2. COM export ---------------------------------------------------------------------------
$msoTrue = -1; $msoFalse = 0; $ppSaveAsOpenXMLPresentation = 24
$app = New-Object -ComObject PowerPoint.Application
$hadOpenPresentations = $app.Presentations.Count -gt 0

function Open-Copy([string]$path) {
  # read-only, untitled copy, no window
  return $app.Presentations.Open($path, $msoTrue, $msoTrue, $msoFalse)
}

try {
  # 2a thumbnails + previews
  $pres = $app.Presentations.Open($Source, $msoTrue, $msoFalse, $msoFalse)
  try {
    foreach ($slide in $pres.Slides) {
      $id = [string]$slide.SlideID
      if (-not $wanted.ContainsKey($id)) { continue }
      $slide.Export((Join-Path $stage "thumbs\$id.png"), 'PNG', 480, 270)
      $slide.Export((Join-Path $stage "previews\$id.png"), 'PNG', 1280, 720)
    }
    $layoutCount = $pres.SlideMaster.CustomLayouts.Count
  } finally { $pres.Close() }
  Write-Host ("Vorschaubilder exportiert ({0:n1} s)" -f $sw.Elapsed.TotalSeconds)

  # 2b one mini PPTX per slide
  if (-not $SkipMini) {
    foreach ($id in $wanted.Keys) {
      $p = Open-Copy $Source
      try {
        for ($i = $p.Slides.Count; $i -ge 1; $i--) {
          $sl = $p.Slides.Item($i)
          if ([string]$sl.SlideID -ne $id) { $sl.Delete() }
        }
        if ($p.Slides.Count -ne 1) { throw "Mini-PPTX fuer Folie $id hat $($p.Slides.Count) Folien." }
        $p.SaveAs((Join-Path $stage "slides\$id.pptx"), $ppSaveAsOpenXMLPresentation)
      } finally { $p.Close() }
    }
    Write-Host ("Mini-PPTX je Folie erzeugt ({0:n1} s)" -f $sw.Elapsed.TotalSeconds)
  }

  # 2c one empty slide per layout ("Grundlayouts") + thumbnail with sample text
  $layoutInfo = @()
  for ($k = 1; $k -le $layoutCount; $k++) {
    $p = Open-Copy $Source
    try {
      # add the new slide first: deleting all slides first can drop the master's layouts
      $layout = $p.SlideMaster.CustomLayouts.Item($k)
      $name = $layout.Name
      $sl = $p.Slides.AddSlide(1, $layout)
      for ($i = $p.Slides.Count; $i -ge 2; $i--) { $p.Slides.Item($i).Delete() }
      $p.SaveAs((Join-Path $stage "layouts\layout-$k.pptx"), $ppSaveAsOpenXMLPresentation)
      # thumbnail only: fill visible placeholders with sample text (not saved)
      $w = $p.PageSetup.SlideWidth; $h = $p.PageSetup.SlideHeight
      foreach ($sh in $sl.Shapes) {
        if ($sh.Type -ne 14) { continue } # msoPlaceholder
        if ($sh.Left -lt 0 -or $sh.Top -lt 0 -or $sh.Left -gt $w -or $sh.Top -gt $h) { continue }
        $t = $sh.PlaceholderFormat.Type
        if ($t -eq 1 -or $t -eq 3) { $sh.TextFrame.TextRange.Text = 'Titel der Folie' }
        elseif ($t -eq 4) { $sh.TextFrame.TextRange.Text = 'Untertitel' }
        elseif (($t -eq 2 -or $t -eq 7) -and $sh.Height -gt 100) { $sh.TextFrame.TextRange.Text = "Erster Punkt`rZweiter Punkt`rDritter Punkt" }
      }
      $sl.Export((Join-Path $stage "thumbs\layout-$k.png"), 'PNG', 480, 270)
      $sl.Export((Join-Path $stage "previews\layout-$k.png"), 'PNG', 1280, 720)
      $layoutInfo += [pscustomobject]@{ index = $k; name = $name; file = "layouts/layout-$k.pptx"; thumb = "thumbs/layout-$k.png"; preview = "previews/layout-$k.png" }
    } finally { $p.Close() }
  }
  Write-Host ("Grundlayouts erzeugt: {0} ({1:n1} s)" -f $layoutCount, $sw.Elapsed.TotalSeconds)

  # 2d base template for a new presentation: master + first title slide
  $p = Open-Copy $Source
  try {
    $coverId = $null
    foreach ($s in $ex.slides) { if (-not $s.hidden -and $s.layout -eq $ex.masters[0].layouts[0].name) { $coverId = [string]$s.slideId; break } }
    for ($i = $p.Slides.Count; $i -ge 1; $i--) {
      $sl = $p.Slides.Item($i)
      if ([string]$sl.SlideID -ne $coverId) { $sl.Delete() }
    }
    $p.SaveAs((Join-Path $stage 'template\base.pptx'), $ppSaveAsOpenXMLPresentation)
  } finally { $p.Close() }
}
finally {
  if (-not $hadOpenPresentations -and $app.Presentations.Count -eq 0) { $app.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

$layoutFile = Join-Path $work 'layouts.json'
[IO.File]::WriteAllText($layoutFile, (ConvertTo-Json -InputObject @($layoutInfo) -Depth 4), (New-Object Text.UTF8Encoding $false))

# --- 3. Merge library.json, copy files, lint summary ---------------------------------------
$mergeArgs = @((Join-Path $PSScriptRoot 'merge-library.js'), '--extract', $extractFile, '--layouts', $layoutFile, '--stage', $stage, '--out', $out, '--source', $Source)
if ($SkipMini) { $mergeArgs += '--keep-slides' }
& node @mergeArgs
if ($LASTEXITCODE -ne 0) { throw 'Zusammenfuehren von library.json fehlgeschlagen.' }

Remove-Item -Recurse -Force $work -ErrorAction SilentlyContinue
Write-Host ("Fertig in {0:n1} s." -f $sw.Elapsed.TotalSeconds)
