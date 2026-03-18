const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function checkHomepage() {
    console.log('Fetching homepage document...\n');

    // Get API endpoint
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    // Get homepage document
    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"homepage")]]`
    );

    const data = await response.json();

    if (data.results.length === 0) {
        console.log('❌ No homepage document found!');
        return;
    }

    const homepage = data.results[0];
    console.log('Homepage Document Found:');
    console.log('- ID:', homepage.id);
    console.log('- UID:', homepage.uid);
    console.log('\nHero Image Field:');
    console.log(JSON.stringify(homepage.data.hero_image, null, 2));

    console.log('\nAll Data Fields:');
    console.log(Object.keys(homepage.data));
}

checkHomepage().catch(console.error);
