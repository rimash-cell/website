import fs from 'fs';
import { basename } from 'path';

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

// Helper to safely parse CSV line (same as before)
function parseCSVLine(line) {
    const result = [];
    let start = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            let field = line.substring(start, i);
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1).replace(/""/g, '"');
            }
            result.push(field);
            start = i + 1;
        }
    }
    let lastField = line.substring(start);
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.slice(1, -1).replace(/""/g, '"');
    }
    result.push(lastField);
    return result;
}

async function getDocuments() {
    console.log("Fetching documents from Prismic CDN...");
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`); // Use token to see drafts if needed, though migration updates published docs via migration API
    if (!apiResponse.ok) throw new Error(`Failed to init CDN API: ${apiResponse.status}`);

    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    // Get all work documents
    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"work")]]&pageSize=100`
    );

    if (!response.ok) throw new Error(`Failed to fetch documents: ${response.status}`);
    const data = await response.json();
    console.log(`Found ${data.results.length} documents.`);
    return data.results;
}

// Update document via Migration API
async function updateDocument(docId, data, uid) {
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

    if (response.status === 429) {
        console.log(`Rate limited on ${uid}, waiting...`);
        await new Promise(r => setTimeout(r, 2000));
        return updateDocument(docId, data, uid);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        console.error(`Failed to update ${uid}:`, JSON.stringify(error));
        return null;
    }

    // console.log(`Updated ${uid}`);
    return response.json();
}

async function run() {
    // 1. Read CSV
    const csvPath = "Rima Alshoufi's Portfolio - Works.csv";
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');
    const headers = parseCSVLine(lines[0]);

    // Create map of UID to CSV Data
    const csvDataMap = new Map();

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentLine = parseCSVLine(lines[i]);
        const data = {};
        headers.forEach((header, index) => {
            data[header.trim()] = currentLine[index];
        });

        // Derive UID - same logic as before or use Slug column
        const uid = data['Slug'] || data['Name'].toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        if (uid) {
            csvDataMap.set(uid, data);
        }
    }

    // 2. Fetch Prismic Docs
    const existingDocs = await getDocuments();

    console.log(`Processing ${existingDocs.length} documents...`);

    let updatedCount = 0;

    for (const doc of existingDocs) {
        const csvItem = csvDataMap.get(doc.uid);
        if (!csvItem) {
            console.warn(`No CSV entry for ${doc.uid}`);
            continue;
        }

        // Determine fields
        const orderVal = parseInt(csvItem['Order']);
        const order = isNaN(orderVal) ? null : orderVal;

        // Hidden logic: Respect CSV Draft and Archived status
        const isArchived = csvItem['Archived'] === 'true';
        const isDraft = csvItem['Draft'] === 'true';
        const hidden = isArchived || isDraft;

        // Featured logic
        const featured = csvItem['Featured'] === 'true';

        // Check if update needed
        const newData = { ...doc.data };
        newData.order = order;
        newData.hidden = hidden;
        newData.featured = featured;

        /*
        console.log(`Updating ${doc.uid}: Order=${order}, Hidden=${hidden}, Featured=${featured}`);
        */

        await updateDocument(doc.id, {
            title: doc.data.title?.[0]?.text || doc.uid,
            type: doc.type,
            uid: doc.uid,
            lang: doc.lang,
            data: newData
        }, doc.uid);

        process.stdout.write(".");
        updatedCount++;
    }

    console.log(`\nUpdated ${updatedCount} documents.`);
}

run().catch(console.error);
