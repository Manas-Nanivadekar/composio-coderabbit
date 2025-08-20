@echo off
echo Starting PDF Chat API Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if GOOGLE_API_KEY is set
if "%GOOGLE_API_KEY%"=="" (
    echo Error: GOOGLE_API_KEY environment variable is not set.
    echo Please set your Google API key using:
    echo   set GOOGLE_API_KEY=your_api_key_here
    echo.
    echo Or create a .env file in the pdf_extraction/src directory
    pause
    exit /b 1
)

REM Run the Python startup script
python start-pdf-api.py

pause
