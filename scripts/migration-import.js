import fs from 'fs';

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

// Valid categories based on the custom type model
const VALID_CATEGORIES = ["Luxury Retail", "Hospitality", "Experiential Spaces", "Residential", "Other"];

async function uploadDocument(doc) {
    const url = 'https://migration.prismic.io/documents';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: doc.title || doc.uid || 'Untitled',
            type: doc.type,
            uid: doc.uid,
            lang: 'en-gb', // Try en-gb as it's common for UAE
            data: doc.data
        })
    });

    if (response.status === 429) {
        console.log(`Rate limited on ${doc.uid}. Waiting 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
        return uploadDocument(doc);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => null);

        // If en-gb fails, try en-us per default
        if (error?.message?.includes('language') && doc.lang_retry !== true) {
            console.log(`Language failed for ${doc.uid}, retrying with en-us...`);
            doc.lang = 'en-us';
            doc.lang_retry = true;
            return uploadDocument(doc);
        }

        console.error(`Failed to upload ${doc.uid}: ${response.status}`, JSON.stringify(error));
        return null;
    }

    const result = await response.json();
    console.log(`Successfully uploaded ${doc.uid} (ID: ${result.id})`);
    return result;
}

function mapCategory(cat) {
    if (!cat) return "Other";
    if (cat.toLowerCase().includes("retail")) return "Luxury Retail";
    if (cat.toLowerCase().includes("hospitality")) return "Hospitality";
    if (cat.toLowerCase().includes("experiential")) return "Experiential Spaces";
    if (cat.toLowerCase().includes("exhibitions")) return "Experiential Spaces";
    if (cat.toLowerCase().includes("residential")) return "Residential";
    return "Other";
}

async function run() {
    const works = JSON.parse(fs.readFileSync('prismic_import_works.json', 'utf-8'));
    console.log(`Final pass for 35 items. Fixing categories and handling language codes...`);

    for (const work of works) {
        // 1. Fix images
        if (work.data.main_image && !work.data.main_image.url) delete work.data.main_image;
        if (work.data.preview_image && !work.data.preview_image.url) delete work.data.preview_image;

        // 2. Fix categories
        work.data.category = mapCategory(work.data.category);

        // 3. Ensure title for dashboard
        work.title = work.data.title[0]?.text || work.uid;

        await uploadDocument(work);
        await new Promise(r => setTimeout(r, 800)); // Conservative speed
    }

    console.log('Final migration script completed.');
}

run().catch(console.error);
