@echo off
chcp 65001 >nul
title Instalador Blacktop Police Chase (App de Escritorio)

echo.
echo  ==========================================
echo   BLACKTOP: POLICE CHASE — Instalador App
echo  ==========================================
echo.

REM Verificar Python
where python >nul 2>&1
if errorlevel 1 (
    where python3 >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Python no encontrado.
        echo Instala Python desde: https://python.org
        echo (marca "Add Python to PATH" en la instalacion)
        echo.
        pause
        exit /b 1
    )
)

REM Verificar Chromium/Chrome
where chromium >nul 2>&1
if errorlevel 1 (
    where chrome >nul 2>&1
    if errorlevel 1 (
        echo [AVISO] Chromium/Chrome no encontrado.
        echo La app abrira en tu navegador predeterminado (puede no ser fullscreen).
        echo.
    )
)

set ROOT=%~dp0
set ROOT=%ROOT:~0,-1%

echo [INFO] Carpeta del juego: %ROOT%
echo.

REM Crear accesos directos en Escritorio y Menu Inicio
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$ws = New-Object -ComObject WScript.Shell; ^
 $desktop = [Environment]::GetFolderPath('Desktop'); ^
 $startMenu = [Environment]::GetFolderPath('StartMenu') + '\Programs'; ^
 $icon = '%ROOT%\icon.png'; ^
 ^
 $sc = $ws.CreateShortcut('%desktop%\Blacktop Police Chase.lnk'); ^
 $sc.TargetPath = 'python.exe'; ^
 $sc.Arguments = '\"%ROOT%\launch.py\"'; ^
 $sc.WorkingDirectory = '%ROOT%'; ^
 $sc.IconLocation = $icon; ^
 $sc.Description = 'Blacktop Police Chase - 100% offline, fullscreen'; ^
 $sc.Save(); ^
 ^
 $sc2 = $ws.CreateShortcut('%desktop%\Blacktop Police Chase (Sin Policia).lnk'); ^
 $sc2.TargetPath = 'python.exe'; ^
 $sc2.Arguments = '\"%ROOT%\launch_no_police.py\"'; ^
 $sc2.WorkingDirectory = '%ROOT%'; ^
 $sc2.IconLocation = $icon; ^
 $sc2.Description = 'Modo sin policia (auto-desactivada)'; ^
 $sc2.Save(); ^
 ^
 $sc3 = $ws.CreateShortcut('%desktop%\Blacktop Police Chase (MOD).lnk'); ^
 $sc3.TargetPath = 'python.exe'; ^
 $sc3.Arguments = '\"%ROOT%\mod_launcher.py\"'; ^
 $sc3.WorkingDirectory = '%ROOT%'; ^
 $sc3.IconLocation = $icon; ^
 $sc3.Description = 'Selector de nivel de policia y trafico'; ^
 $sc3.Save(); ^
 ^
 Write-Host 'Accesos directos creados en el Escritorio.'"

echo.
echo ✅ Listo. Tienes 3 accesos directos en el Escritorio:
echo    • Blacktop Police Chase
echo    • Blacktop Police Chase (Sin Policía)
echo    • Blacktop Police Chase (MOD)
echo.
echo 🎮 Doble clic en cualquiera para jugar en pantalla completa (modo app).
echo.
pause