# build.ps1
# Comprehensive build script for C++ project with Boost, Crow, and Firebase C++ SDK

# Project Configuration
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$compiler = "g++"
$source = Join-Path $projectRoot "src/main.cpp"
$output = Join-Path $projectRoot "bin/app.exe"
$mingwPath = "C:/msys64/mingw64"

# Firebase SDK paths
$firebaseSdkPath = "D:/C++/DSA/SocialApp/backend/firebase_cpp_sdk" # Update with actual Firebase SDK location
$firebaseIncludePath = "$firebaseSdkPath/include"
$firebaseLibPath = "$firebaseSdkPath/lib"

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

# Locate Boost headers
$boostIncludePath = Find-BoostHeaders
if (-not $boostIncludePath) {
    Write-Host "Boost headers not found. Please reinstall Boost." -ForegroundColor Red
    exit 1
}

# Detailed library search and logging
Write-Host "Searching for Boost System library variants..." -ForegroundColor Cyan
$boostSystemLibs = Get-ChildItem "$mingwPath/lib" -Filter "libboost_system*" 
$boostSystemLibs | ForEach-Object {
    Write-Host "Found: $($_.Name)" -ForegroundColor Green
}

# Select the 64-bit library
$systemLibPath = ($boostSystemLibs | Where-Object { $_.Name -like "*x64*" } | Select-Object -First 1).FullName
$systemLibName = (Split-Path $systemLibPath -LeafBase) -replace "^lib",""

# Boost Thread library
$boostThreadLibs = Get-ChildItem "$mingwPath/lib" -Filter "libboost_thread*"
$threadLibPath = ($boostThreadLibs | Where-Object { $_.Name -like "*x64*" } | Select-Object -First 1).FullName
$threadLibName = (Split-Path $threadLibPath -LeafBase) -replace "^lib",""

Write-Host "`nSelected Libraries:" -ForegroundColor Cyan
Write-Host "Boost Include Path: $boostIncludePath" -ForegroundColor Green
Write-Host "System Library: $systemLibName" -ForegroundColor Green
Write-Host "Thread Library: $threadLibName" -ForegroundColor Green

# Verify Firebase paths
if (!(Test-Path $firebaseIncludePath)) {
    Write-Host "Firebase include path not found: $firebaseIncludePath" -ForegroundColor Red
    exit 1
}
if (!(Test-Path $firebaseLibPath)) {
    Write-Host "Firebase library path not found: $firebaseLibPath" -ForegroundColor Red
    exit 1
}

Write-Host "`nFirebase SDK:" -ForegroundColor Cyan
Write-Host "Include Path: $firebaseIncludePath" -ForegroundColor Green
Write-Host "Library Path: $firebaseLibPath" -ForegroundColor Green

# Include and Library Paths
$include_paths = @(
    "-I$projectRoot/include",
    "-I$projectRoot/include/crow",
    "-I$boostIncludePath",
    "-I$firebaseIncludePath"
) -join " "

$library_paths = "-L$mingwPath/lib -L$firebaseLibPath"

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
    New-Item -ItemType Directory -Path $binDir | Out-Null
    Write-Host "Created bin directory" -ForegroundColor Green
}

# Build flags
$libs = "-l$systemLibName -l$threadLibName -lws2_32 -lwsock32 -lpthread -lfirebase_app"
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
    Invoke-Expression $command
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nBuild successful!" -ForegroundColor Green
        Write-Host "You can run the application with: .\bin\app.exe" -ForegroundColor Cyan
    } else {
        throw "Build failed with exit code: $LASTEXITCODE"
    }
} catch {
    Write-Host "`nBuild failed: $_" -ForegroundColor Red
    
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Verify compiler installation:" -ForegroundColor Cyan
    Invoke-Expression "$compiler --version"
    
    Write-Host "`n2. List available Boost libraries:" -ForegroundColor Cyan
    Get-ChildItem "$mingwPath\lib" -Filter "libboost_*" | ForEach-Object { 
        Write-Host "   $($_.Name)" 
    }

    Write-Host "`n3. Firebase Library Path Contents:" -ForegroundColor Cyan
    Get-ChildItem $firebaseLibPath -Recurse | ForEach-Object {
        Write-Host "   $($_.FullName)"
    }
}
