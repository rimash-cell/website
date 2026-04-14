import { createSign } from 'node:crypto';

function json(res, status, payload) {
    res.status(status).json(payload);
}

function getRequiredEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing ${name}`);
    }

    return value;
}

function base64UrlEncode(value) {
    const source = typeof value === 'string' ? value : JSON.stringify(value);
    return Buffer.from(source)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function parsePrivateKey(rawKey) {
    return rawKey.replace(/\\n/g, '\n');
}

function hasGoogleSheetsConfig() {
    return Boolean(
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
        process.env.GOOGLE_SHEETS_PRIVATE_KEY &&
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    );
}

async function getGoogleAccessToken() {
    const clientEmail = getRequiredEnv('GOOGLE_SHEETS_CLIENT_EMAIL');
    const privateKey = parsePrivateKey(getRequiredEnv('GOOGLE_SHEETS_PRIVATE_KEY'));
    const now = Math.floor(Date.now() / 1000);

    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    const payload = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
    const signer = createSign('RSA-SHA256');
    signer.update(unsignedToken);
    signer.end();

    const signature = signer.sign(privateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

    const assertion = `${unsignedToken}.${signature}`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion
        })
    });

    if (!tokenResponse.ok) {
        const details = await tokenResponse.text();
        throw new Error(`Google token request failed: ${details}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}

async function appendSubmissionToSheet(submission) {
    if (!hasGoogleSheetsConfig()) {
        return { stored: false, reason: 'sheet_not_configured' };
    }

    const accessToken = await getGoogleAccessToken();
    const spreadsheetId = getRequiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID');
    const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:J';

    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [[
                    submission.timestamp,
                    submission.name,
                    submission.email,
                    submission.mobile,
                    submission.location,
                    submission.area,
                    submission.message,
                    submission.source,
                    submission.userAgent,
                    submission.ip
                ]]
            })
        }
    );

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Google Sheets append failed: ${details}`);
    }

    return { stored: true };
}

async function sendNotificationEmail(submission) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!resendApiKey || !fromEmail) {
        return { sent: false, reason: 'email_not_configured' };
    }

    if (!toEmail) {
        return { sent: false, reason: 'recipient_not_configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            reply_to: submission.email,
            subject: `New website inquiry from ${submission.name}`,
            text: [
                `Name: ${submission.name}`,
                `Email: ${submission.email}`,
                `Mobile: ${submission.mobile}`,
                `Location: ${submission.location}`,
                `Area: ${submission.area}`,
                '',
                'Message:',
                submission.message,
                '',
                `Submitted at: ${submission.timestamp}`,
                `Source: ${submission.source}`,
                `User agent: ${submission.userAgent}`,
                `IP: ${submission.ip}`
            ].join('\n')
        })
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Resend email failed: ${details}`);
    }

    return { sent: true };
}

function normalizeField(value, maxLength = 2000) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function getIpAddress(req) {
    const forwarded = req.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }

    return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        json(res, 405, { ok: false, error: 'Method not allowed' });
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const honeypot = normalizeField(body.company || '', 200);

        if (honeypot) {
            json(res, 200, { ok: true });
            return;
        }

        const submission = {
            timestamp: new Date().toISOString(),
            name: normalizeField(body.name, 120),
            email: normalizeField(body.email, 160),
            mobile: normalizeField(body.mobile, 60),
            location: normalizeField(body.location, 160),
            area: normalizeField(body.area, 120) || 'Not specified',
            message: String(body.message || '').trim().slice(0, 5000),
            source: normalizeField(req.headers.origin || req.headers.referer || 'website', 500),
            userAgent: normalizeField(req.headers['user-agent'] || 'unknown', 500),
            ip: getIpAddress(req)
        };

        if (!submission.name || !submission.email || !submission.message) {
            json(res, 400, { ok: false, error: 'Please share your name, email, and project details.' });
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(submission.email)) {
            json(res, 400, { ok: false, error: 'Please enter a valid email address.' });
            return;
        }

        let sheetResult = { stored: false, reason: 'not_attempted' };
        let emailResult = { sent: false, reason: 'not_attempted' };

        try {
            sheetResult = await appendSubmissionToSheet(submission);
        } catch (sheetError) {
            console.error('Contact submission sheet storage failed:', sheetError);
        }

        try {
            emailResult = await sendNotificationEmail(submission);
        } catch (emailError) {
            console.error('Contact notification email failed:', emailError);
        }

        if (!sheetResult.stored && !emailResult.sent) {
            throw new Error('No contact destination is currently available.');
        }

        json(res, 200, {
            ok: true,
            emailSent: emailResult.sent === true,
            storedInSheet: sheetResult.stored === true
        });
    } catch (error) {
        console.error('Contact submission failed:', error);
        json(res, 500, {
            ok: false,
            error: 'Your message could not be sent right now. Please try again shortly.'
        });
    }
}
