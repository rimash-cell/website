import fs from 'fs';
import { basename } from 'path';

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function downloadImage(url, dest) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
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
    fs.unlinkSync(filePath);
    return result;
}

async function updateHomepage(imageData) {
    // 1. Get existing homepage doc
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    const searchResponse = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"homepage")]]`
    );
    const searchData = await searchResponse.json();
    const homeDoc = searchData.results[0];

    if (!homeDoc) {
        console.error("No homepage document found to update.");
        return;
    }

    const newData = { ...homeDoc.data };
    newData.hero_image = {
        id: imageData.id,
        url: imageData.url,
        alt: "Rima Alshoufi Hero",
        copyright: null,
        dimensions: imageData.dimensions
    };

    const response = await fetch(`https://migration.prismic.io/documents/${homeDoc.id}`, {
        method: 'PUT',
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: homeDoc.data.title?.[0]?.text || "Homepage",
            type: "homepage",
            uid: homeDoc.uid,
            lang: homeDoc.lang,
            data: newData
        })
    });

    if (response.status === 429) {
        console.log("Rate limited on homepage update, waiting...");
        await new Promise(r => setTimeout(r, 2000));
        return updateHomepage(imageData);
    }

    if (!response.ok) {
        const err = await response.text();
        console.error("Failed to update homepage:", err);
    } else {
        console.log("Homepage hero image updated!");
    }
}

async function run() {
    const url = "https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b5a41a83bb0532fc41cc4b_Untitled%20design%20(3).png";
    const tempFile = "temp_hero.png";

    console.log("Downloading hero image...");
    await downloadImage(url, tempFile);

    console.log("Uploading to Prismic...");
    const asset = await uploadToPrismic(tempFile);

    console.log("Updating Homepage document...");
    await updateHomepage(asset);
}

run().catch(console.error);
