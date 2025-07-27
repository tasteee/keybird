param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

# Get the directory path from the file path
$directoryPath = Split-Path -Path $FilePath -Parent

# Create the directory if it doesn't exist
if ($directoryPath -and !(Test-Path -Path $directoryPath)) {
    New-Item -ItemType Directory -Path $directoryPath -Force | Out-Null
    Write-Host "Created directory: $directoryPath" -ForegroundColor Green
}

# Check if file already exists
if (Test-Path -Path $FilePath) {
    # Update the last write time (like Unix touch)
    (Get-Item $FilePath).LastWriteTime = Get-Date
    Write-Host "Updated timestamp for: $FilePath" -ForegroundColor Yellow
} else {
    # Create the file
    New-Item -ItemType File -Path $FilePath -Force | Out-Null
    Write-Host "Created file: $FilePath" -ForegroundColor Green
}
