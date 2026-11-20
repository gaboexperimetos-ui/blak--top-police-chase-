@echo off
chcp 65001 >nul
title BLACKTOP: POLICE CHASE (offline)

echo.
echo  ==========================================
echo   BLACKTOP: POLICE CHASE — Offline
echo  ==========================================
echo.

REM Verificar Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado.
    echo.
    echo Descargalo desde: https://nodejs.org
    echo (elige "Windows Installer .msi" LTS)
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado: & node --version
echo.
echo Iniciando servidor en http://localhost:3000 ...
echo.
echo Despues de la primera carga, el Service Worker guarda todo:
echo podras jugar SIN INTERNET (apaga el wifi).
echo.
echo Para cerrar: cierra esta ventana o pulsa Ctrl+C
echo.

node server.js

echo.
echo Servidor detenido.
pause