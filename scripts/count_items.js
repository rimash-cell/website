const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function main() {
    try {
        const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
        const apiData = await apiResponse.json();
        const ref = apiData.refs[0].ref;

        // Query documents to get total count
        const response = await fetch(
            `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&access_token=${TOKEN}&pageSize=100`
        );
        const data = await response.json();
        console.log("Total Documents:", data.total_results_size);

        // Count specifically of type 'work'
        const workResponse = await fetch(
            `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&access_token=${TOKEN}&pageSize=100&q=[[at(document.type,"work")]]`
        );
        const workData = await workResponse.json();
        console.log("Work Documents:", workData.total_results_size);

        if (workData.results) {
            console.log("\nWork titles listed in Prismic:");
            workData.results.forEach((d, i) => {
                const title = d.data.title?.[0]?.text || d.uid || 'No Title';
                console.log(`${i+1}. ${title}`);
            });
        }

    } catch (e) {
        console.error("Error fetching Count:", e);
    }
}

main();
