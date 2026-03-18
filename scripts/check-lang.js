const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function checkLang() {
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    const apiData = await apiResponse.json();
    console.log("Repository languages:", apiData.languages);

    const ref = apiData.refs[0].ref;
    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&pageSize=1`
    );
    const data = await response.json();
    if (data.results.length > 0) {
        console.log("First document lang:", data.results[0].lang);
    }
}
checkLang().catch(console.error);
