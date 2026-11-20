<#
.SYNOPSIS
  Theme-Lint: reports per slide which content uses fixed colors / fixed fonts
  instead of theme colors (a:schemeClr) and theme fonts (+mj-lt / +mn-lt).
.DESCRIPTION
  Warnings only - never modifies the template. Works in Windows PowerShell 5.1 and pwsh.
.EXAMPLE
  powershell -File scripts/lint-templates.ps1
  powershell -File scripts/lint-templates.ps1 -Json test-results/lint.json
#>
param(
  [string]$Source = (Join-Path (Split-Path -Parent $PSScriptRoot) 'templates\Library.pptx'),
  [string]$Json = ''
)
$ErrorActionPreference = 'Stop'
$cli = Join-Path $PSScriptRoot 'lint-cli.js'
$nodeArgs = @($cli, '--source', $Source)
if ($Json) { $nodeArgs += @('--json', $Json) }
& node @nodeArgs
if ($LASTEXITCODE -ne 0) { throw "Theme-Lint fehlgeschlagen (Exit $LASTEXITCODE)" }
