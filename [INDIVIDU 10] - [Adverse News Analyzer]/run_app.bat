@echo off
echo Starting AML News Analysis Web App...
echo.
cd /d "%~dp0"
streamlit run main.py
pause
