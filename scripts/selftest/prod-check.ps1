<#
.SYNOPSIS
  Checks the PRODUCTION add-in (GitHub Pages, no local server) in PowerPoint desktop
  (Windows PowerShell 5.1): opens a test deck whose task pane auto-opens, clicks slide cards via
  UI Automation, verifies the inserts via COM and saves window screenshots to test-results\screens.
  Requires: scripts/install-sideload.ps1 has registered manifest.xml; PowerPoint closed.
#>
param(
  [string[]]$Click = @('Deckblatt einfügen', 'Säulendiagramm mit Wachstumspfeil (CAGR) einfügen'),
  [int]$WaitSec = 40
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$out = Join-Path $root 'test-results'
$screens = Join-Path $out 'screens'
New-Item -ItemType Directory -Force $screens | Out-Null
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, System.Drawing, System.Windows.Forms
Add-Type @"
using System; using System.Runtime.InteropServices;
public static class SlidelibWin {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

function Save-WindowShot([IntPtr]$h, [string]$file) {
  [void][SlidelibWin]::SetForegroundWindow($h); Start-Sleep -Milliseconds 700
  $r = New-Object SlidelibWin+RECT; [void][SlidelibWin]::GetWindowRect($h, [ref]$r)
  $w = $r.Right - $r.Left; $hgt = $r.Bottom - $r.Top
  $bmp = New-Object Drawing.Bitmap($w, $hgt)
  $g = [Drawing.Graphics]::FromImage($bmp)
  # PrintWindow with PW_RENDERFULLCONTENT also works when the screen is locked or the window is covered
  $hdc = $g.GetHdc(); [void][SlidelibWin]::PrintWindow($h, $hdc, 2); $g.ReleaseHdc($hdc)
  $bmp.Save($file, [Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
  Write-Host "Screenshot: $file"
}

if (Get-Process POWERPNT -ErrorAction SilentlyContinue) { throw 'Bitte PowerPoint schliessen.' }
$prodId = ([xml](Get-Content -Raw (Join-Path $root 'manifest.xml'))).OfficeApp.Id
$deck = Join-Path $out 'prod-check.pptx'
& node (Join-Path $PSScriptRoot '..\lib\webextension.js') (Join-Path $out 'target-ion.pptx') $deck $prodId '1.0.0.0'
$proc = Start-Process -FilePath 'C:\Program Files\Microsoft Office\root\Office16\POWERPNT.EXE' -ArgumentList "`"$deck`"" -PassThru
Start-Sleep -Seconds 8
$deadline = (Get-Date).AddSeconds($WaitSec)
$win = $null; $card = $null
$rootEl = [Windows.Automation.AutomationElement]::RootElement
while ((Get-Date) -lt $deadline) {
  $proc.Refresh()
  if ($proc.MainWindowHandle -ne [IntPtr]::Zero) {
    $win = [Windows.Automation.AutomationElement]::FromHandle($proc.MainWindowHandle)
    $cond = New-Object Windows.Automation.PropertyCondition([Windows.Automation.AutomationElement]::NameProperty, $Click[0])
    $card = $win.FindFirst([Windows.Automation.TreeScope]::Descendants, $cond)
    if ($card) { break }
  }
  Start-Sleep -Seconds 2
}
[void][SlidelibWin]::ShowWindow($proc.MainWindowHandle, 3) # maximize
Start-Sleep 2
Save-WindowShot $proc.MainWindowHandle (Join-Path $screens 'prod-pane.png')
if (-not $card) { throw "Seitenbereich bzw. Karte '$($Click[0])' nicht gefunden (Add-in nicht geladen?)." }

$app = New-Object -ComObject PowerPoint.Application
$pres = $null; foreach ($p in $app.Presentations) { if ($p.FullName -ieq $deck) { $pres = $p } }
$results = @()
foreach ($name in $Click) {
  $pres.Windows.Item(1).View.GotoSlide(1)
  $before = $pres.Slides.Count
  $cond = New-Object Windows.Automation.PropertyCondition([Windows.Automation.AutomationElement]::NameProperty, $name)
  $el = $win.FindFirst([Windows.Automation.TreeScope]::Descendants, $cond)
  if (-not $el) { $results += "$name : Karte nicht gefunden"; continue }
  $sw = [Diagnostics.Stopwatch]::StartNew()
  ($el.GetCurrentPattern([Windows.Automation.InvokePattern]::Pattern)).Invoke()
  while ($pres.Slides.Count -eq $before -and $sw.ElapsedMilliseconds -lt 10000) { Start-Sleep -Milliseconds 50 }
  $sw.Stop()
  $sel = $app.ActiveWindow.Selection.SlideRange
  $results += ("{0}: Folien {1}->{2}, neue Folie an Position {3}, Design {4}, ~{5} ms (inkl. Klick-Latenz)" -f $name, $before, $pres.Slides.Count, $sel.SlideIndex, $sel.Design.Name, $sw.ElapsedMilliseconds)
  Start-Sleep 2
}
Save-WindowShot $proc.MainWindowHandle (Join-Path $screens 'prod-after-insert.png')
$results | ForEach-Object { Write-Host $_ }
[IO.File]::WriteAllLines((Join-Path $out 'prod-check.txt'), [string[]]$results)
$pres.Saved = -1; $pres.Close()
if ($app.Presentations.Count -eq 0) { $app.Quit() }
