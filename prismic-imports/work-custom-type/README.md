# Work Custom Type Import Package

This folder contains the `customtypes/work` custom type ready for import into Prismic.

Files included:
- `customtypes/work/index.json` — the updated Work custom type JSON
- `make-zip.ps1` — PowerShell script to create `work-custom-type.zip`


How to prepare and create the ZIP (no scripts run by me):

1. Copy your updated `customtypes/work/index.json` into this package folder path:

`prismic-imports/work-custom-type/customtypes/work/index.json`

	You can copy it from the repo root `customtypes/work/index.json`.

2. Open PowerShell in the repository root and run:

```powershell
.\prismic-imports\work-custom-type\make-zip.ps1
```

After running that script, the ZIP will be created at:

`prismic-imports/work-custom-type/work-custom-type.zip`

If you prefer to use Windows Explorer instead: copy the `customtypes/work` folder into `prismic-imports/work-custom-type/customtypes/`, then right-click the `work-custom-type` folder -> Send to -> Compressed (zipped) folder.

I have not executed any scripts or created the ZIP file; this package and script are provided so you can create the ZIP locally.
