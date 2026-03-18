const fs = require('fs');
const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function main() {
    try {
        const apiRes = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
        const apiData = await apiRes.json();
        const ref = apiData.refs[0].ref;

        const docRes = await fetch(
            `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&access_token=${TOKEN}&q=[[at(my.work.uid,"mhg-headquarter")]]`
        );
        const docData = await docRes.json();
        
        fs.writeFileSync('c:\\Users\\rimaa\\3D Objects\\Website\\inspect_project.json', JSON.stringify(docData.results[0], null, 2));
        console.log("Written to file.");

    } catch (e) {
        console.error(e);
    }
}

main();
