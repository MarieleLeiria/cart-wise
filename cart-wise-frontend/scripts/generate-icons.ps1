Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\public\icons"
$sizes = 16, 32, 48, 128

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

foreach ($size in $sizes) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.Clear([System.Drawing.Color]::Transparent)
  $s = $size / 128.0

  # Background: green rounded square (small margin for 128px store guidance)
  $m = 4 * $s
  $bg = New-RoundedPath $m $m (128 * $s - 2 * $m) (128 * $s - 2 * $m) (24 * $s)
  $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 163, 74))), $bg)

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), (9 * $s)
  $pen.StartCap = "Round"; $pen.EndCap = "Round"; $pen.LineJoin = "Round"

  # Handle + basket outline
  $pts = @(
    (New-Object System.Drawing.PointF (28 * $s), (38 * $s)),
    (New-Object System.Drawing.PointF (42 * $s), (38 * $s)),
    (New-Object System.Drawing.PointF (54 * $s), (80 * $s)),
    (New-Object System.Drawing.PointF (92 * $s), (80 * $s)),
    (New-Object System.Drawing.PointF (100 * $s), (52 * $s)),
    (New-Object System.Drawing.PointF (46 * $s), (52 * $s))
  )
  $g.DrawLines($pen, [System.Drawing.PointF[]]$pts)

  # Wheels
  $r = 7 * $s
  $g.FillEllipse($white, (58 * $s) - $r, (96 * $s) - $r, 2 * $r, 2 * $r)
  $g.FillEllipse($white, (88 * $s) - $r, (96 * $s) - $r, 2 * $r, 2 * $r)

  $file = Join-Path $outDir "icon$size.png"
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Host "Wrote $file"
}
