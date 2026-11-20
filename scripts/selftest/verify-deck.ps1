<#
.SYNOPSIS
  COM verification of a self-test run (Windows PowerShell 5.1).
  Attaches to the running PowerPoint, finds the test presentation and checks every inserted slide:
  design/master = target design, no additional masters, theme colors = target colors,
  fonts used = target theme fonts (exceptions only for slides flagged by the theme lint),
  layout mapping. Writes <ResultJson>.verify.json.
#>
param(
  [Parameter(Mandatory = $true)][string]$DeckPath,
  [Parameter(Mandatory = $true)][string]$ResultJson,
  [Parameter(Mandatory = $true)][string]$TargetJson,
  [Parameter(Mandatory = $true)][string]$LibraryJson,
  [string]$SaveAs = '',
  [switch]$Quit
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$result = [IO.File]::ReadAllText($ResultJson, $utf8) | ConvertFrom-Json
$target = [IO.File]::ReadAllText($TargetJson, $utf8) | ConvertFrom-Json
$lib = [IO.File]::ReadAllText($LibraryJson, $utf8) | ConvertFrom-Json
$lintByKey = @{}
foreach ($s in $lib.slides) { $lintByKey[$s.key] = $s.lint }

$app = New-Object -ComObject PowerPoint.Application
$pres = $null
foreach ($p in $app.Presentations) { if ($p.FullName -ieq $DeckPath) { $pres = $p } }
if (-not $pres) { throw "Praesentation $DeckPath ist in PowerPoint nicht geoeffnet (Presentations=$($app.Presentations.Count))." }

$design = $pres.Designs.Item(1)
$targetColors = @($target.colors)
$themeFonts = @($target.majorFont, $target.minorFont)

function Get-Fonts($shapes, $acc) {
  foreach ($sh in $shapes) {
    try {
      if ($sh.Type -eq 6) { Get-Fonts $sh.GroupItems $acc; continue } # msoGroup
      if ($sh.HasTable -eq -1) {
        $t = $sh.Table
        for ($r = 1; $r -le $t.Rows.Count; $r++) { for ($c = 1; $c -le $t.Columns.Count; $c++) {
          $tf = $t.Cell($r, $c).Shape.TextFrame2
          if ($tf.HasText -eq -1) { foreach ($run in $tf.TextRange.Runs()) { if ($run.Text.Trim()) { [void]$acc.Add($run.Font.Name) } } }
        } }
        continue
      }
      if ($sh.HasTextFrame -eq -1 -and $sh.TextFrame2.HasText -eq -1) {
        foreach ($run in $sh.TextFrame2.TextRange.Runs()) { if ($run.Text.Trim()) { [void]$acc.Add($run.Font.Name) } }
      }
    } catch { }
  }
}

$layoutsAfter = @(); foreach ($l in $design.SlideMaster.CustomLayouts) { $layoutsAfter += $l.Name }
$checks = @()
foreach ($r in $result.results) {
  $row = [ordered]@{ key = $r.key; title = $r.title; kind = $r.kind; jsOk = $r.ok; ms = $r.ms; position = $r.position; selectedOk = $r.selectedOk }
  if (-not $r.ok) { $row.pass = $false; $row.reason = "Einfuegen fehlgeschlagen: $($r.error)"; $checks += [pscustomobject]$row; continue }
  $sid = [int64](($r.newSlideIds[0] -split '#')[0])
  $slide = $null
  try { $slide = $pres.Slides.FindBySlideID($sid) } catch { }
  if (-not $slide) { $row.pass = $false; $row.reason = "Folie $sid nicht gefunden"; $checks += [pscustomobject]$row; continue }
  $row.designName = $slide.Design.Name
  $row.layout = $slide.CustomLayout.Name
  $colors = @(); for ($i = 1; $i -le 12; $i++) { $colors += $slide.ThemeColorScheme.Colors($i).RGB }
  $row.colorsMatch = (@(Compare-Object $colors $targetColors -SyncWindow 0).Count -eq 0)
  $fonts = New-Object 'System.Collections.Generic.HashSet[string]'
  Get-Fonts $slide.Shapes $fonts
  $foreign = @($fonts | Where-Object { $themeFonts -notcontains $_ })
  $row.fonts = @($fonts)
  $row.foreignFonts = $foreign
  $lint = $lintByKey[$r.key]
  $row.lintLevel = if ($lint) { $lint.level } else { 'ok' }
  $designOk = ($row.designName -eq $target.designName)
  $fontsOk = ($foreign.Count -eq 0)
  $row.designOk = $designOk
  $row.fontsOk = $fontsOk
  $row.fontException = (-not $fontsOk -and $row.lintLevel -eq 'warn')
  $row.timeOk = ($r.ms -lt 2000)
  $row.positionOk = ($r.position -eq 2)
  $row.pass = $designOk -and $row.colorsMatch -and ($fontsOk -or $row.fontException) -and $row.timeOk -and $row.positionOk -and $r.selectedOk
  $reasons = @()
  if (-not $designOk) { $reasons += "Design '$($row.designName)' statt '$($target.designName)'" }
  if (-not $row.colorsMatch) { $reasons += 'Theme-Farben weichen ab' }
  if (-not $fontsOk) { $reasons += ("Fremde Schriften: " + ($foreign -join ', ') + $(if ($row.fontException) { ' (Lint-Ausnahme)' } else { '' })) }
  if (-not $row.timeOk) { $reasons += "zu langsam ($($r.ms) ms)" }
  if (-not $row.positionOk) { $reasons += "Position $($r.position) statt 2" }
  if (-not $r.selectedOk) { $reasons += 'neue Folie nicht ausgewaehlt' }
  $row.reason = $reasons -join '; '
  $checks += [pscustomobject]$row
}

$summary = [ordered]@{
  deck            = $DeckPath
  designsBefore   = $target.designs
  designsAfter    = $pres.Designs.Count
  designNames     = @(foreach ($d in $pres.Designs) { $d.Name })
  layoutsBefore   = @($target.layouts)
  layoutsAfter    = $layoutsAfter
  slideCountAfter = $pres.Slides.Count
  checks          = $checks
}
[IO.File]::WriteAllText($ResultJson + '.verify.json', ($summary | ConvertTo-Json -Depth 6), $utf8)
$designsAfter = $pres.Designs.Count
if ($SaveAs) { $pres.SaveCopyAs($SaveAs) }
if ($Quit) {
  $pres.Saved = -1
  $pres.Close()
  if ($app.Presentations.Count -eq 0) { $app.Quit() }
}
[void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
Write-Host ("Geprueft: {0} Folien, bestanden: {1}, Designs vorher/nachher: {2}/{3}" -f $checks.Count, @($checks | Where-Object { $_.pass }).Count, $target.designs, $designsAfter)
