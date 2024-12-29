@echo off
echo Checking system setup...

echo.
echo Checking GCC version:
g++ --version

echo.
echo Checking GCC location:
where g++

echo.
echo Checking Boost headers:
if exist "C:\msys64\mingw64\include\boost" (
    echo Boost headers found in MSYS2
) else (
    echo Boost headers NOT found in MSYS2
)

echo.
echo Checking PATH environment:
echo %PATH%

echo.
echo Checking MinGW installation:
if exist "C:\MinGW" (
    echo WARNING: Old MinGW installation found at C:\MinGW
    echo Please remove this to avoid conflicts
) else (
    echo No old MinGW installation found - Good!
)

pause