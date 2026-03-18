Project custom type import (Project Source template)

Files included:
- `customtypes/project/index.json` (the Project custom type JSON)

How to create the ZIP (Windows PowerShell):

1. Open PowerShell in the workspace root `c:\Users\rimaa\3D Objects\Website`.
2. Run the included script:

```powershell
.\prismic-imports\project-custom-type\make-zip.ps1
```

This creates `project-custom-type.zip` in the workspace root containing `customtypes/project/index.json` ready for upload.

How to import into Prismic (UI):

1. Open your Prismic repository.
2. Settings → Custom Types → Import.
3. Upload `project-custom-type.zip` and follow the UI prompts.

Notes:
- This will add a new custom type named `project` (label "Project").
- It will not modify existing custom types; it only adds the new `project` type.
- If you want me to import it directly, provide a short-lived admin/API token and repo name.
