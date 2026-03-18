const fs = require('fs');
const vm = require('vm');

function checkFile(path) {
    console.log('Checking syntax of', path);
    const html = fs.readFileSync(path, 'utf-8');
    const matches = html.match(/<script>([\s\S]*?)<\/script>/g);
    if (!matches) {
        console.log('No <script> tags found.');
        return;
    }
    matches.forEach((m, idx) => {
        const code = m.replace('<script>', '').replace('</script>', '');
        try {
            new vm.Script(code);
            console.log(`Script tag #${idx+1} is SYNTAX VALID.`);
        } catch(e) {
            console.error(`Script tag #${idx+1} HAS SYNTAX ERROR:\n`, e);
        }
    });
}

checkFile('c:\\Users\\rimaa\\3D Objects\\Website\\website_draft_1\\work.html');
checkFile('c:\\Users\\rimaa\\3D Objects\\Website\\website_draft_1\\index.html');
