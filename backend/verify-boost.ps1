# verify-boost.ps1
$mingwPath = "C:/msys64/mingw64"
$libPath = "$mingwPath/lib"

Write-Host "Searching for Boost System library variants..."
Get-ChildItem $libPath -Filter "libboost_system*" | ForEach-Object {
    Write-Host "Found: $($_.Name)"
}

Write-Host "`nChecking current PATH:"
$env:Path -split ';' | Where-Object { $_ -like '*msys64*' } | ForEach-Object {
    Write-Host "MSYS2 Path: $_"
}

Write-Host "`nVerifying library load path:"
if (Test-Path "$libPath/libboost_system.dll.a") {
    Write-Host "✓ Found libboost_system.dll.a"
} elseif (Test-Path "$libPath/libboost_system.a") {
    Write-Host "✓ Found libboost_system.a"
} else {
    Write-Host "✗ No standard Boost System library found"
}

# Check if we're running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Host "`nRunning as Administrator: $isAdmin"