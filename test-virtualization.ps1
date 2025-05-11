# PowerShell script to test Canvas Editor virtualization optimization

# Define colors for better readability
$GREEN = [ConsoleColor]::Green
$RED = [ConsoleColor]::Red
$YELLOW = [ConsoleColor]::Yellow
$CYAN = [ConsoleColor]::Cyan

# Display header
Write-Host ""
Write-Host "Canvas Editor Performance Optimization Test" -ForegroundColor $CYAN
Write-Host "=======================================" -ForegroundColor $CYAN
Write-Host ""
Write-Host "IMPORTANT: If you encounter errors, try these solutions:" -ForegroundColor $YELLOW
Write-Host "1. Remove large-document-demo.html and rename large-document-demo.html.new to large-document-demo.html" -ForegroundColor $YELLOW
Write-Host "2. Restart the test with: .\test-virtualization.ps1" -ForegroundColor $YELLOW
Write-Host ""

# Function to measure execution time
function Measure-ExecutionTime {
    param (
        [scriptblock]$ScriptBlock
    )
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    & $ScriptBlock
    $stopwatch.Stop()
    return $stopwatch.ElapsedMilliseconds
}

# Check if Node.js is installed
$nodeVersion = try { node --version } catch { $null }
if ($null -eq $nodeVersion) {
    Write-Host "Node.js is required but not found on your system." -ForegroundColor $RED
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor $YELLOW
    exit 1
}

# Check if npm packages are installed
if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor $YELLOW
    npm install
}

# Run the demo file in the browser
Write-Host "Starting the large document demo..." -ForegroundColor $CYAN
Write-Host "This will open a browser window with a performance test." -ForegroundColor $CYAN
Write-Host ""
Write-Host "Testing will automatically verify if the optimization is working." -ForegroundColor $CYAN
Write-Host ""

# Run the optimization test
$testStartTime = Get-Date
Write-Host "Running optimization verification test..." -ForegroundColor $YELLOW

try {
    # Start the development server
    $serverProcess = Start-Process npm -ArgumentList "run dev" -NoNewWindow -PassThru
    
    # Give it a moment to start
    Start-Sleep -Seconds 3
      # Open the demo file in the default browser
    Start-Process "http://localhost:3000/canvas-editor/large-document-demo.html"
    
    # Wait for user feedback
    Write-Host "The test page has been opened in your browser." -ForegroundColor $CYAN
    Write-Host "Check the performance metrics displayed in the bottom-right corner." -ForegroundColor $CYAN
    Write-Host ""
    Write-Host "Press any key to exit the test..." -ForegroundColor $YELLOW
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Stop the server
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "Test completed successfully!" -ForegroundColor $GREEN
    Write-Host ""
    Write-Host "To use the virtualization optimization in your project:" -ForegroundColor $CYAN
    Write-Host "1. Import the plugin: 'import { createOptimizedEditor } from 'canvas-editor/plugins/virtualization'" -ForegroundColor $YELLOW
    Write-Host "2. Create an optimized editor: 'const editor = createOptimizedEditor(container, data, options)'" -ForegroundColor $YELLOW
    Write-Host ""
    
} catch {
    Write-Host "An error occurred during testing: $_" -ForegroundColor $RED
} finally {
    # Make sure we clean up the server process
    if ($null -ne $serverProcess) {
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Test duration: $((Get-Date) - $testStartTime)" -ForegroundColor $CYAN
Write-Host ""
