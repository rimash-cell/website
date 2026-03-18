import fs from 'fs';
import https from 'https';
import http from 'http';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { basename } from 'path';


const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function downloadImage(url) {
    if (!url) return null;

    const tempPath = `/tmp/${Date.now()}-${basename(url).split('?')[0]}`;
    const client = url.startsWith('https') ? https : http;

    return new Promise((resolve, reject) => {
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const fileStream = createWriteStream(tempPath);
            pipeline(response, fileStream)
                .then(() => resolve(tempPath))
                .catch(reject);
        }).on('error', reject);
    });
}

async function uploadToPrismic(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    const formData = new FormData();
    formData.append('file', blob, basename(filePath));

    const response = await fetch(`https://asset-api.prismic.io/assets?repo=${REPO_NAME}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'repository': REPO_NAME
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
    }

    const result = await response.json();

    // Clean up temp file
    fs.unlinkSync(filePath);

    return result;
}

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

async function updateDocument(docId, data) {
    const url = `https://migration.prismic.io/documents/${docId}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        console.error(`Failed to update ${docId}:`, error);
        return null;
    }

    return response.json();
}

async function run() {
    const works = JSON.parse(fs.readFileSync('prismic_import_works.json', 'utf-8'));
    const existingDocs = await getDocuments();

    console.log(`Processing ${works.length} work items...`);

    for (const work of works) {
        const existingDoc = existingDocs.find(d => d.uid === work.uid);
        if (!existingDoc) {
            console.log(`Skipping ${work.uid} - not in Prismic`);
            continue;
        }

        console.log(`\n Processing ${work.uid}...`);
        const newData = { ...existingDoc.data };

        try {
            // Upload main_image
            if (work.data.main_image?.url) {
                console.log(`  Downloading main image...`);
                const tempFile = await downloadImage(work.data.main_image.url);
                if (tempFile) {
                    console.log(`  Uploading to Prismic...`);
                    const prismicImage = await uploadToPrismic(tempFile);
                    newData.main_image = prismicImage;
                    console.log(`  ✓ Main image uploaded`);
                }
            }

            // Upload preview_image
            if (work.data.preview_image?.url) {
                console.log(`  Downloading preview image...`);
                const tempFile = await downloadImage(work.data.preview_image.url);
                if (tempFile) {
                    console.log(`  Uploading to Prismic...`);
                    const prismicImage = await uploadToPrismic(tempFile);
                    newData.preview_image = prismicImage;
                    console.log(`  ✓ Preview image uploaded`);
                }
            }

            // Upload gallery images in slices
            if (work.data.slices && work.data.slices.length > 0) {
                console.log(`  Processing ${work.data.slices.length} slices...`);
                newData.slices = [...work.data.slices]; // Create a copy of slices

                for (let i = 0; i < newData.slices.length; i++) {
                    const slice = newData.slices[i];
                    if (slice.items && slice.items.length > 0) {
                        for (let j = 0; j < slice.items.length; j++) {
                            const item = slice.items[j];
                            if (item.image && item.image.url) {
                                console.log(`  Downloading gallery image ${j + 1} in slice ${i + 1}...`);
                                const tempFile = await downloadImage(item.image.url);
                                if (tempFile) {
                                    console.log(`  Uploading to Prismic...`);
                                    const prismicImage = await uploadToPrismic(tempFile);
                                    // Update the item in the slice
                                    newData.slices[i].items[j].image = prismicImage;
                                    console.log(`  ✓ Gallery image uploaded`);
                                }
                            }
                        }
                    }
                }
            }

            // Update document
            await updateDocument(existingDoc.id, {
                title: existingDoc.title,
                type: existingDoc.type,
                uid: existingDoc.uid,
                lang: existingDoc.lang,
                data: newData
            });

            console.log(`  Document updated!`);
            await new Promise(r => setTimeout(r, 1000));

        } catch (error) {
            console.error(`  Error processing ${work.uid}:`, error.message);
        }
    }

    console.log('\n✓ Image migration complete!');
}

run().catch(console.error);
