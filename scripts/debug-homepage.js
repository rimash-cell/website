const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function checkHomepageRaw() {
    console.log('Fetching homepage from Migration API...\n');

    // First get from CDN to get the doc ID
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"homepage")]]`
    );

    const data = await response.json();
    const homepage = data.results[0];

    console.log('From CDN:');
    console.log('hero_image:', homepage.data.hero_image);

    // Now try from Migration API
    const migResponse = await fetch(`https://migration.prismic.io/documents/${homepage.id}`, {
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    if (migResponse.ok) {
        const migData = await migResponse.json();
        console.log('\nFrom Migration API:');
        console.log('hero_image:', migData.data?.hero_image);
        console.log('\nAll data keys:', Object.keys(migData.data || {}));
    } else {
        console.log('Migration API error:', await migResponse.text());
    }
}

checkHomepageRaw().catch(console.error);
