const fs = require('fs');
const { JSDOM } = require('jsdom');

async function testPage(filePath) {
    const html = fs.readFileSync(filePath, 'utf-8');
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    
    // Check for script syntax error inside dom
    console.log(`Testing ${filePath}...`);
    // Node run scripts will execute any code inside <script>
    // Let's inspect console errors from the dom
    dom.window.onerror = function(msg, url, line) {
        console.error(`JS ERROR in ${filePath} Line ${line}: ${msg}`);
    };
}
testPage('c:\\Users\\rimaa\\3D Objects\\Website\\website_draft_1\\work.html');
testPage('c:\\Users\\rimaa\\3D Objects\\Website\\website_draft_1\\index.html');
