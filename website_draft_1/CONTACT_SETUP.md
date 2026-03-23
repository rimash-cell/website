# Contact Form Setup

The contact form is wired to `POST /api/contact`.

It does two things on the server:

1. Appends each inquiry to Google Sheets
2. Sends an email notification to the private inbox configured in Vercel

## Google Sheet

Create a sheet with these columns in row 1:

`Timestamp | Name | Email | Mobile | Location | Area | Message | Source | User Agent | IP`

Then:

1. Create a Google Cloud project
2. Enable the Google Sheets API
3. Create a service account
4. Generate a JSON key for that service account
5. Share the spreadsheet with the service account email as an editor

## Vercel Environment Variables

Add these in Vercel:

- `GOOGLE_SHEETS_CLIENT_EMAIL`
- `GOOGLE_SHEETS_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_RANGE`
  Example: `Sheet1!A:J`
- `CONTACT_TO_EMAIL`
  Set to `rima.nfix@gmail.com`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
  Example: `Rima Website <hello@yourdomain.com>`

## Notes

- `CONTACT_TO_EMAIL` is server-side only and is not exposed in the page HTML
- Email sending is optional in code, but Google Sheets storage is required
- After adding the environment variables, redeploy the site
