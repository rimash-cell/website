const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function checkCustomType() {
    console.log('Checking homepage custom type in Prismic...\n');

    const response = await fetch(`https://customtypes.prismic.io/customtypes/homepage`, {
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch custom type:', await response.text());
        return;
    }

    const data = await response.json();
    console.log('Homepage Custom Type Fields:');
    for (const [tabName, tabContent] of Object.entries(data.json)) {
        console.log(`\nTab: ${tabName}`);
        const fields = Object.keys(tabContent);
        fields.forEach(field => {
            const fieldConfig = tabContent[field];
            console.log(`  - ${field} (${fieldConfig.type})`);
        });
    }

    // Check specifically for hero_image
    const hasHeroImage = data.json.Main?.hero_image;
    console.log(`\n✓ hero_image field exists: ${!!hasHeroImage}`);

    if (hasHeroImage) {
        console.log('  Type:', hasHeroImage.type);
    }
}

checkCustomType().catch(console.error);
