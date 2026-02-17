@echo off
echo ==========================================
echo      Grievance AI Model Retrainer
echo ==========================================
echo.

echo [1/2] Generating Dataset from Rules...
python dataset_generator.py
if %ERRORLEVEL% NEQ 0 (
    echo Error generating dataset!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Training ML Model...
python train_model.py
if %ERRORLEVEL% NEQ 0 (
    echo Error training model!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ==========================================
echo      SUCCESS! Model Retrained.
echo ==========================================
pause
