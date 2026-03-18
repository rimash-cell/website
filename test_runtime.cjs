const REPO = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function main() {
    try {
        const apiRes = await fetch(`https://${REPO}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
        const apiData = await apiRes.json();
        const ref = apiData.refs[0].ref;

        const docsRes = await fetch(
            `https://${REPO}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&access_token=${TOKEN}&pageSize=100&q=[[at(document.type,"work")]]`
        );
        const docsData = await docsRes.json();
        const results = docsData.results;

        console.log(`Simulating FOR LOOP on ${results.length} items...`);
        results.sort((a, b) => (a.data.sort_order ?? 9999) - (b.data.sort_order ?? 9999));

        let index = 0;
        results.forEach((item) => {
            index++;
            const data = item.data;
            const title = data.title?.[0]?.text || data.project_title || 'Untitled';
            
            let category = data.type || data.category || 'Other';
            if ((category === 'Other' || !category) && data.intro?.[0]?.text) {
                category = data.intro[0].text.split('|')[0].trim();
            }
            let subcategory = data.project_subcategory || '';
            const img = data.preview_image?.url || data.main_image?.url || '';

            // This part runs in the browser which has document.createElement() available,
            // but we'll simulate properties checks and critical method calls.
            if (!title) throw new Error("Missing title on index " + index);
            if (!category) throw new Error("Missing category on index " + index);
        });
        console.log("FOR LOOP completed SUCCESS with no field crashes.");

    } catch(e) {
        console.error('SIMULATION CRASHED:', e);
    }
}
main();
