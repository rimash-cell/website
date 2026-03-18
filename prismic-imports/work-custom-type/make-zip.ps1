# Creates work-custom-type.zip containing the folder contents
# Note: this does not run automatically. Run it locally to create the ZIP.
$source = "prismic-imports/work-custom-type"
$zip = "prismic-imports/work-custom-type/work-custom-type.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$source\*" -DestinationPath $zip -Force
Write-Output "Created: $zip"
