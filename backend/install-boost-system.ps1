# build-boost.ps1

$boostVersion = "1.86.0"
$boostUnderscoreVersion = $boostVersion.Replace(".", "_")
$downloadUrl = "https://boostorg.jfrog.io/artifactory/main/release/$boostVersion/source/boost_$boostUnderscoreVersion.zip"
$downloadPath = "boost_$boostUnderscoreVersion.zip"
$extractPath = "boost_$boostUnderscoreVersion"

Write-Host "Downloading Boost $boostVersion..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath

Write-Host "Extracting..." -ForegroundColor Cyan
Expand-Archive $downloadPath -DestinationPath .

Push-Location $extractPath
try {
    Write-Host "Bootstrap..." -ForegroundColor Cyan
    ./bootstrap.bat gcc

    Write-Host "Building..." -ForegroundColor Cyan
    ./b2.exe toolset=gcc variant=release link=static,shared threading=multi runtime-link=shared --with-system --with-thread -j4 install --prefix="C:/msys64/mingw64"
} finally {
    Pop-Location
}

Write-Host "Cleaning up..." -ForegroundColor Cyan
Remove-Item $downloadPath -Force
Remove-Item $extractPath -Recurse -Force

Write-Host "Verifying installation..." -ForegroundColor Cyan
Get-ChildItem "C:\msys64\mingw64\lib\libboost_system*"