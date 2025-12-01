@echo off
REM Push a sample image to the Android emulator's Pictures folder.
REM Usage: push-sample.bat C:\path\to\image.jpg

setlocal
if "%1"=="" (
  echo No path provided. Looking for assets\sample-timetable.jpg
  set SRC=%~dp0..\assets\sample-timetable.jpg
) else (
  set SRC=%1
)

echo Pushing %SRC% to emulator...
adb devices
adb push "%SRC%" /sdcard/Pictures/sample-timetable.jpg
if %errorlevel%==0 (
  echo Pushed OK. Open emulator Gallery and pick the image, or use the app picker.
) else (
  echo Failed to push. Ensure adb is on PATH and emulator is running.
)
