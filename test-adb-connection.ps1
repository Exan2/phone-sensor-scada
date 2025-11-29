# Test ADB Connection Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing ADB Connection" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ADB exists in common locations
$adbPaths = @(
    "adb",
    "C:\adb\adb.exe",
    "C:\Program Files\Android\android-sdk\platform-tools\adb.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools\adb.exe",
    "D:\HSCADA\adb\adb.exe"
)

$adbFound = $false
$adbPath = $null

foreach ($path in $adbPaths) {
    try {
        if ($path -eq "adb") {
            $result = Get-Command adb -ErrorAction SilentlyContinue
            if ($result) {
                $adbPath = "adb"
                $adbFound = $true
                break
            }
        } else {
            if (Test-Path $path) {
                $adbPath = $path
                $adbFound = $true
                break
            }
        }
    } catch {
        continue
    }
}

if (-not $adbFound) {
    Write-Host "❌ ADB not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ADB:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://developer.android.com/studio/releases/platform-tools" -ForegroundColor Yellow
    Write-Host "2. Extract to C:\adb" -ForegroundColor Yellow
    Write-Host "3. Add C:\adb to your PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or see INSTALL_ADB.md for detailed instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ ADB found at: $adbPath" -ForegroundColor Green
Write-Host ""

# Test ADB connection
Write-Host "Checking for connected devices..." -ForegroundColor Cyan
Write-Host ""

try {
    if ($adbPath -eq "adb") {
        $devices = & adb devices
    } else {
        $devices = & $adbPath devices
    }
    
    Write-Host $devices
    
    $deviceCount = ($devices | Select-String "device$" | Measure-Object).Count
    
    if ($deviceCount -gt 0) {
        Write-Host ""
        Write-Host "✅ Device connected! ($deviceCount device(s))" -ForegroundColor Green
        Write-Host ""
        Write-Host "Testing sensor data access..." -ForegroundColor Cyan
        
        # Test battery reading
        if ($adbPath -eq "adb") {
            $battery = & adb shell dumpsys battery | Select-String "level:"
        } else {
            $battery = & $adbPath shell dumpsys battery | Select-String "level:"
        }
        
        if ($battery) {
            Write-Host "✅ Can read battery data: $battery" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Could not read battery data" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host ""
        Write-Host "❌ No devices found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "1. Phone is connected via USB" -ForegroundColor Yellow
        Write-Host "2. USB Debugging is enabled" -ForegroundColor Yellow
        Write-Host "3. You've authorized the computer on your phone" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error running ADB: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

