param(
    [string]$WorkspaceRoot = (Get-Location).Path
)

$source = Join-Path $WorkspaceRoot "customtypes\project\index.json"
$dest = Join-Path $WorkspaceRoot "project-custom-type.zip"

if (Test-Path $source) {
    Compress-Archive -Path $source -DestinationPath $dest -Force
    Write-Output "Created ZIP: $dest"
} else {
    Write-Error "Source not found: $source"
}
