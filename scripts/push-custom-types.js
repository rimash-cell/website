import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function pushCustomType(id) {
    console.log(`Pushing custom type: ${id}...`);

    const filePath = path.join(__dirname, `../customtypes/${id}/index.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Custom Types API Insert/Update
    // First try update
    let response = await fetch(`https://customtypes.prismic.io/customtypes/${id}`, {
        method: 'POST', // Insert or Update? API says POST to /insert or PUT/POST to /:id? Not sure. usually POST /insert for new.
        // Let's try insert first
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
    });

    if (response.status === 409) {
        console.log(`${id} already exists, updating...`);
        // Update
        response = await fetch(`https://customtypes.prismic.io/customtypes/${id}`, {
            method: 'PUT',
            headers: {
                'repository': REPO_NAME,
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        });
    }

    // Actually, looking at docs, /customtypes/insert is for new. /customtypes/:id is for update (PUT).
    // Let's try INSERT endpoint properly if needed.
    // Re-doing logic: Check if exists, then update or insert.

    // Check existence
    const checkRes = await fetch(`https://customtypes.prismic.io/customtypes/${id}`, {
        headers: {
            'repository': REPO_NAME,
            'Authorization': TOKEN
        }
    });

    if (checkRes.ok) {
        // Exists, update
        console.log("Updating existing type...");
        const updateRes = await fetch(`https://customtypes.prismic.io/customtypes/${id}`, {
            method: 'PUT',
            headers: {
                'repository': REPO_NAME,
                'Authorization': TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        });
        if (!updateRes.ok) console.error("Update failed:", await updateRes.text());
        else console.log("Update successful.");
    } else {
        // Doesn't exist (assuming 404), insert
        console.log("Inserting new type...");
        const insertRes = await fetch(`https://customtypes.prismic.io/customtypes/insert`, {
            method: 'POST',
            headers: {
                'repository': REPO_NAME,
                'Authorization': TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(content)
        });
        if (!insertRes.ok) console.error("Insert failed:", await insertRes.text());
        else console.log("Insert successful.");
    }
}

async function run() {
    await pushCustomType('homepage');
    await pushCustomType('about');
}

run().catch(console.error);
