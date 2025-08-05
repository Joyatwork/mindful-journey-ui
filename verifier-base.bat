@echo off
echo ================================================
echo       VERIFICATION BASE DE DONNEES ACTUELLE
echo ================================================
echo.

cd /d "c:\Users\camar\Bureau\mindful-journey-ui\backend"
php check_users_current.php

echo.
echo ================================================
echo Base de donnees consultee: backend/database/database.sqlite
echo ================================================
pause
