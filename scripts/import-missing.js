import fs from 'fs';

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

// Valid categories based on the custom type model
const VALID_CATEGORIES = ["Luxury Retail", "Hospitality", "Experiential Spaces", "Residential", "Other"];

async function getDocuments() {
    console.log("Fetching documents from Prismic CDN...");
    // First get the master ref
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2`);
    if (!apiResponse.ok) throw new Error(`Failed to init CDN API: ${apiResponse.status}`);

    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    // Get all work documents
    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"work")]]&pageSize=100`
    );

    if (!response.ok) throw new Error(`Failed to fetch documents: ${response.status}`);
    const data = await response.json();
    console.log(`Found ${data.results.length} documents via CDN.`);
    return data.results;
}

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

        console.log("Error details:", JSON.stringify(error, null, 2));

        console.error(`Failed to upload ${doc.uid}: ${response.status}`);
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
    const existingDocs = await getDocuments();
    const existingUids = new Set(existingDocs.map(d => d.uid));

    console.log(`Checking ${works.length} items against ${existingUids.size} existing documents...`);

    let count = 0;
    for (const work of works) {
        if (existingUids.has(work.uid)) {
            console.log(`Skipping ${work.uid} - already exists`);
            continue;
        }

        console.log(`Importing ${work.uid}...`);

        // 1. Fix images - remove them for initial creation to avoid validation errors
        // We will let fix-images.js handle the actual image upload and update
        delete work.data.main_image;
        delete work.data.preview_image;

        // Remove images from slices too
        if (work.data.slices) {
            // Filter out image_gallery slices entirely to avoid validation errors on empty items
            work.data.slices = work.data.slices.filter(s => s.slice_type !== 'image_gallery');

            // For other slices, strip images if present
            work.data.slices.forEach(slice => {
                if (slice.items) {
                    slice.items.forEach(item => {
                        if (item.image) delete item.image;
                    });
                }
            });
        }

        // 2. Fix categories
        work.data.category = mapCategory(work.data.category);

        // 3. Ensure title for dashboard
        work.title = work.data.title[0]?.text || work.uid;

        await uploadDocument(work);
        await new Promise(r => setTimeout(r, 800)); // Conservative speed
        count++;
    }

    console.log(`\nImported ${count} new documents.`);
}

run().catch(console.error);
