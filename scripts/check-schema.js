const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function checkSchema() {
    console.log(`Checking ${REPO_NAME} / work custom type...`);
    // Custom Types API
    const response = await fetch(`https://customtypes.prismic.io/customtypes/work`, {
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    if (!response.ok) {
        console.error("Failed to fetch custom type:", await response.text());
        return;
    }

    const data = await response.json();
    console.log("Work Custom Type Schema Keys:");
    // Print keys in each tab
    for (const [tabName, tabContent] of Object.entries(data.json)) {
        console.log(`- Tab: ${tabName}`);
        console.log(`  Fields: ${Object.keys(tabContent).join(', ')}`);
    }
}

checkSchema().catch(console.error);
