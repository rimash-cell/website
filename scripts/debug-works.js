const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';

async function debugWorks() {
    // Get master ref
    const apiRes = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    const apiData = await apiRes.json();
    const masterRef = apiData.refs.find(r => r.isMasterRef)?.ref;
    console.log('Master ref:', masterRef);

    // 1. Total works (no filter)
    const allRes = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${masterRef}&q=[[at(document.type,"work")]]&pageSize=5&access_token=${TOKEN}`
    );
    const allData = await allRes.json();
    console.log('\nTotal work docs:', allData.total_results_size);

    if (allData.results?.length > 0) {
        console.log('\nFirst 5 works:');
        allData.results.forEach(doc => {
            console.log(`  - ${doc.uid}: featured=${doc.data.featured}, hidden=${doc.data.hidden}, has_image=${!!doc.data.main_image?.url}`);
        });
    }

    // 2. Works with featured=true
    const featuredRes = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${masterRef}&q=[[at(document.type,"work")],[at(my.work.featured,true)]]&pageSize=5&access_token=${TOKEN}`
    );
    const featuredData = await featuredRes.json();
    console.log('\nWorks with featured=true:', featuredData.total_results_size);

    // 3. Works with hidden=false
    const notHiddenRes = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${masterRef}&q=[[at(document.type,"work")],[not(my.work.hidden,true)]]&pageSize=5&access_token=${TOKEN}`
    );
    const notHiddenData = await notHiddenRes.json();
    console.log('Works with hidden!=true:', notHiddenData.total_results_size);
    if (notHiddenData.results?.length > 0) {
        notHiddenData.results.forEach(doc => {
            console.log(`  - ${doc.uid}: featured=${doc.data.featured}, hidden=${doc.data.hidden}, has_image=${!!doc.data.main_image?.url}`);
        });
    }
}

debugWorks().catch(console.error);
