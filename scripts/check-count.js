import fs from 'fs';

const REPO_NAME = 'rima';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function checkRefs() {
    console.log("Checking CDN Refs with Token...");
    try {
        const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
        if (!apiResponse.ok) throw new Error(`Failed to init CDN API: ${apiResponse.status}`);

        const apiData = await apiResponse.json();
        console.log("Refs found:", apiData.refs.map(r => `${r.id} (${r.label})`).join(', '));

        // Check count for each ref
        for (const refObj of apiData.refs) {
            const response = await fetch(
                `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${refObj.ref}&q=[[at(document.type,"work")]]&pageSize=1`
            );
            const data = await response.json();
            console.log(`Ref ${refObj.label}: ${data.total_results_size} documents.`);
        }

    } catch (e) {
        console.error(e.message);
    }
}

checkRefs();
