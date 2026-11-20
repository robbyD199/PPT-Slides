<#
.SYNOPSIS
  COM verification for the "keep source formatting" self-test run (Windows PowerShell 5.1):
  counts masters/designs after repeated inserts and checks that inserted slides use the library master.
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
$designs = @(foreach ($d in $pres.Designs) { [ordered]@{ name = $d.Name; layouts = $d.SlideMaster.CustomLayouts.Count; accent1 = ('{0:X6}' -f $d.SlideMaster.Theme.ThemeColorScheme.Colors(5).RGB) } })
$used = @{}
$checks = @()
foreach ($r in $result.results) {
  if (-not $r.ok) { $checks += [ordered]@{ title = $r.title; ok = $false; error = $r.error }; continue }
  $sid = [int64](($r.newSlideIds[0] -split '#')[0])
  $s = $pres.Slides.FindBySlideID($sid)
  $used[$s.Design.Name] = 1 + [int]$used[$s.Design.Name]
  $checks += [ordered]@{ title = $r.title; ok = $true; ms = $r.ms; position = $r.position; design = $s.Design.Name; layout = $s.CustomLayout.Name }
}
$summary = [ordered]@{
  deck            = $DeckPath
  designsBefore   = $target.designs
  designsAfter    = $pres.Designs.Count
  designs         = $designs
  designsUsedByInserted = $used.Keys.Count
  inserted        = @($checks | Where-Object { $_.ok }).Count
  checks          = $checks
}
[IO.File]::WriteAllText($ResultJson + '.verify.json', ($summary | ConvertTo-Json -Depth 6), $utf8)
if ($SaveAs) { $pres.SaveCopyAs($SaveAs) }
$after = $pres.Designs.Count
if ($Quit) {
  $pres.Saved = -1
  $pres.Close()
  if ($app.Presentations.Count -eq 0) { $app.Quit() }
}
[void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
Write-Host ("Vorlagenformat: {0} Folien eingefuegt, Designs vorher {1} / nachher {2}, eingefuegte Folien nutzen {3} Design(s): {4}" -f $summary.inserted, $target.designs, $after, $used.Keys.Count, (($used.Keys) -join ' | '))
