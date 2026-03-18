import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';
const IMAGES_DIR = path.join(__dirname, '../downloaded-images');

async function uploadImageToPrismic(imagePath, filename) {
    console.log(`Uploading ${filename}...`);
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath), filename);

    const response = await fetch(`https://asset-api.prismic.io/assets?repo=${REPO_NAME}`, {
        method: 'POST',
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            ...form.getHeaders()
        },
        body: form
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload ${filename}: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
}

async function getAboutDoc() {
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"about")]]`
    );
    const data = await response.json();
    return data.results[0];
}

async function createOrUpdateAbout() {
    console.log("Starting About Page Migration...");

    // 1. Upload Images
    const heroImage = await uploadImageToPrismic(path.join(IMAGES_DIR, 'about-hero.png'), 'about-hero.png');

    const galleryImages = [];
    const galleryFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.startsWith('about-gallery-'));
    // Sort to keep order if possible
    galleryFiles.sort();

    for (const f of galleryFiles) {
        const img = await uploadImageToPrismic(path.join(IMAGES_DIR, f), f);
        galleryImages.push(img);
    }

    // 2. Prepare Data
    const aboutData = {
        title: [{ type: 'heading1', text: 'About Rima Alshoufi', spans: [] }],
        hero_image: {
            id: heroImage.id,
            url: heroImage.url,
            dimensions: heroImage.dimensions,
            alt: "Rima Alshoufi Portrait",
            copyright: null
        },
        professional_photos: galleryImages.map(img => ({
            image: {
                id: img.id,
                url: img.url,
                dimensions: img.dimensions,
                alt: "Professional Photo",
                copyright: null
            },
            caption: ""
        })),
        // Add some default text if new
        intro: [{ type: 'paragraph', text: 'Luxury Retail & Experiential Brand Strategist.', spans: [] }],
        experience: [{ type: 'paragraph', text: 'Over a decade of experience in luxury retail and hospitality.', spans: [] }],
        skills: [{ skill: "Creative Direction" }, { skill: "Brand Strategy" }]
    };

    // 3. Check existence
    const existingDoc = await getAboutDoc();

    if (existingDoc) {
        console.log(`Updating existing About document (${existingDoc.id})...`);
        const response = await fetch(`https://migration.prismic.io/documents/${existingDoc.id}`, {
            method: 'PUT',
            headers: {
                'repository': REPO_NAME,
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: "About",
                type: "about",
                lang: existingDoc.lang,
                data: aboutData
            })
        });

        if (!response.ok) console.error("Update failed:", await response.text());
        else console.log("About document updated successfully!");

    } else {
        console.log("Creating new About document...");
        const response = await fetch(`https://migration.prismic.io/documents`, {
            method: 'POST',
            headers: {
                'repository': REPO_NAME,
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: "About",
                type: "about",
                lang: "en-gb", // Correct lang
                data: aboutData
            })
        });

        if (!response.ok) console.error("Creation failed:", await response.text());
        else {
            const json = await response.json();
            console.log("About document created successfully! ID:", json.id);
        }
    }
}

createOrUpdateAbout().catch(console.error);
