# build.ps1
# Improved build script for C++ project with Boost and Crow

# Project Configuration
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$compiler = "g++"
$source = Join-Path $projectRoot "src/main.cpp"
$output = Join-Path $projectRoot "bin/app.exe"
$mingwPath = "C:/msys64/mingw64"

# Boost and Library Detection
function Find-BoostHeaders {
    $boostPaths = @(
        "$mingwPath/include/boost-1_86",
        "$mingwPath/include/boost"
    )

    foreach ($path in $boostPaths) {
        if (Test-Path "$path/boost/system/error_code.hpp") {
            return $path
        }
    }
    return $null
}

function Find-BoostLibrary {
    param (
        [string]$libPattern
    )
    
    $libs = Get-ChildItem "$mingwPath\lib" -Filter $libPattern -ErrorAction SilentlyContinue
    
    # First try to find MT x64 version
    $mtLib = $libs | Where-Object { $_.Name -match "mt-x64" } | Select-Object -First 1
    if ($mtLib) {
        return $mtLib.Name -replace "^lib" -replace "\.dll\.a$" -replace "\.a$"
    }
    
    # Fallback to any x64 version
    $x64Lib = $libs | Where-Object { $_.Name -match "x64" } | Select-Object -First 1
    if ($x64Lib) {
        return $x64Lib.Name -replace "^lib" -replace "\.dll\.a$" -replace "\.a$"
    }
    
    return $null
}

# Locate Boost headers
$boostIncludePath = Find-BoostHeaders
if (-not $boostIncludePath) {
    Write-Host "Boost headers not found. Please reinstall Boost." -ForegroundColor Red
    exit 1
}

# Find required libraries
Write-Host "Searching for Boost libraries..." -ForegroundColor Cyan
$systemLibName = Find-BoostLibrary "libboost_system*.a"
$threadLibName = Find-BoostLibrary "libboost_thread*.a"

if (-not $systemLibName -or -not $threadLibName) {
    Write-Host "Required Boost libraries not found:" -ForegroundColor Red
    if (-not $systemLibName) { Write-Host "Missing: Boost System library" -ForegroundColor Red }
    if (-not $threadLibName) { Write-Host "Missing: Boost Thread library" -ForegroundColor Red }
    exit 1
}

Write-Host "`nSelected Libraries:" -ForegroundColor Cyan
Write-Host "Boost Include Path: $boostIncludePath" -ForegroundColor Green
Write-Host "System Library: $systemLibName" -ForegroundColor Green
Write-Host "Thread Library: $threadLibName" -ForegroundColor Green

# Include and Library Paths
$include_paths = @(
    "-I$projectRoot/include",
    "-I$projectRoot/include/crow",
    "-I$boostIncludePath"
) -join " "

$library_paths = "-L$mingwPath/lib"

# Project structure verification
Write-Host "`nVerifying project structure:" -ForegroundColor Cyan
$verificationPassed = $true

if (Test-Path $source) {
    Write-Host "✓ Found main.cpp" -ForegroundColor Green
} else {
    Write-Host "✗ Missing main.cpp at $source" -ForegroundColor Red
    $verificationPassed = $false
}

if (Test-Path "$projectRoot/include/crow/crow_all.h") {
    Write-Host "✓ Found crow_all.h" -ForegroundColor Green
} else {
    Write-Host "✗ Missing crow_all.h" -ForegroundColor Red
    $verificationPassed = $false
}

# Create bin directory
$binDir = Join-Path $projectRoot "bin"
if (!(Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
    Write-Host "Created bin directory" -ForegroundColor Green
}

# Build flags
$libs = "-l$systemLibName -l$threadLibName -lws2_32 -lwsock32 -lpthread"
$flags = "-std=c++17 -fpermissive"

# Verification check
if (-not $verificationPassed) {
    Write-Host "`nVerification failed. Please fix the above issues before building." -ForegroundColor Red
    exit 1
}

# Build command
$command = "$compiler $source -o $output $include_paths $library_paths $flags $libs"
Write-Host "`nBuilding with command: $command" -ForegroundColor Cyan

# Build execution
try {
    $buildOutput = Invoke-Expression "$command 2>&1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nBuild successful!" -ForegroundColor Green
        Write-Host "You can run the application with: .\bin\app.exe" -ForegroundColor Cyan
    } else {
        Write-Host "`nBuild failed with output:" -ForegroundColor Red
        Write-Host $buildOutput
        
        Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
        Write-Host "1. Verify compiler installation:" -ForegroundColor Cyan
        Invoke-Expression "$compiler --version"
        
        Write-Host "`n2. Available Boost libraries:" -ForegroundColor Cyan
        Get-ChildItem "$mingwPath\lib" -Filter "libboost_*" | ForEach-Object { 
            Write-Host "   $($_.Name)" 
        }

        Write-Host "`n3. Verify Boost headers:" -ForegroundColor Cyan
        $criticalHeaders = @(
            "boost/system/error_code.hpp",
            "boost/thread.hpp"
        )
        foreach ($header in $criticalHeaders) {
            $headerPath = Join-Path $boostIncludePath $header
            if (Test-Path $headerPath) {
                Write-Host "   ✓ Found $header" -ForegroundColor Green
            } else {
                Write-Host "   ✗ Missing $header" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "`nBuild failed: $_" -ForegroundColor Red
}