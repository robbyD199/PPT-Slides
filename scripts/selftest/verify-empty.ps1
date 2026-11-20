<#
.SYNOPSIS
  COM verification for the "empty presentation" self-test run (Windows PowerShell 5.1).
  Checks: first insert lands on slide 1, second insert after it, "keep source formatting" imports the
  library master (one additional design). Writes <ResultJson>.verify.json and closes the deck.
#>
param(
  [Parameter(Mandatory = $true)][string]$DeckPath,
  [Parameter(Mandatory = $true)][string]$ResultJson,
  [Parameter(Mandatory = $true)][string]$TargetJson,
  [string]$SaveAs = '',
  [switch]$Quit
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object Text.UTF8Encoding $false
$result = [IO.File]::ReadAllText($ResultJson, $utf8) | ConvertFrom-Json
$target = [IO.File]::ReadAllText($TargetJson, $utf8) | ConvertFrom-Json
$app = New-Object -ComObject PowerPoint.Application
$pres = $null
foreach ($p in $app.Presentations) { if ($p.FullName -ieq $DeckPath) { $pres = $p } }
if (-not $pres) { throw "Praesentation $DeckPath ist nicht geoeffnet." }

$slides = @()
foreach ($s in $pres.Slides) {
  $slides += [ordered]@{ index = $s.SlideIndex; id = $s.SlideID; design = $s.Design.Name; layout = $s.CustomLayout.Name }
}
$keepId = $null
if ($result.extra.keepSource.newSlideIds) { $keepId = [int64](($result.extra.keepSource.newSlideIds[0] -split '#')[0]) }
$keepDesign = $null
if ($keepId) { try { $keepDesign = $pres.Slides.FindBySlideID($keepId).Design.Name } catch { } }
$summary = [ordered]@{
  deck          = $DeckPath
  designsBefore = $target.designs
  designsAfter  = $pres.Designs.Count
  designNames   = @(foreach ($d in $pres.Designs) { $d.Name })
  targetDesign  = $target.designName
  slides        = $slides
  emptyInsertOk = [bool]$result.extra.emptyInsert.ok
  secondInsertOk = [bool]$result.extra.secondInsert.ok
  keepSourceDesign = $keepDesign
  keepSourceImportedMaster = ($pres.Designs.Count -eq ($target.designs + 1) -and $keepDesign -ne $target.designName)
  destinationSlidesUseTarget = (@($slides | Select-Object -First 2 | Where-Object { $_.design -ne $target.designName }).Count -eq 0)
}
[IO.File]::WriteAllText($ResultJson + '.verify.json', ($summary | ConvertTo-Json -Depth 6), $utf8)
if ($SaveAs) { $pres.SaveCopyAs($SaveAs) }
if ($Quit) {
  $pres.Saved = -1
  $pres.Close()
  if ($app.Presentations.Count -eq 0) { $app.Quit() }
}
[void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
Write-Host ("Leere Praesentation: 1. Einfuegen ok={0}, 2. Einfuegen ok={1}, Vorlagenformat importiert Master={2}" -f $summary.emptyInsertOk, $summary.secondInsertOk, $summary.keepSourceImportedMaster)
