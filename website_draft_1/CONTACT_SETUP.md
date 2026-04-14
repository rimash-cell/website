# Contact Form Setup

The contact form is wired to `POST /api/contact`.

It can do two things on the server:

1. Appends each inquiry to Google Sheets
2. Sends an email notification to the private inbox configured in Vercel

The form now succeeds as long as at least one destination is configured.

## Google Sheet (Optional but recommended)

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

- Google Sheets storage is optional if email notifications are configured
- Email sending is optional if Google Sheets storage is configured
- The site now requires one working destination: Google Sheets, email, or both
- After adding or changing the environment variables, redeploy the site
