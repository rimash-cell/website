import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const importData = JSON.parse(fs.readFileSync('prismic_import_works.json', 'utf-8'));
const importDir = 'prismic_import';

if (!fs.existsSync(importDir)) {
    fs.mkdirSync(importDir);
}

importData.forEach(doc => {
    const fileName = `${doc.uid}.json`;
    fs.writeFileSync(path.join(importDir, fileName), JSON.stringify(doc, null, 2));
});

console.log(`Created ${importData.length} files in ${importDir}`);

try {
    execSync(`zip -r prismic_import.zip ${importDir}`);
    console.log('Successfully created prismic_import.zip');
} catch (e) {
    console.error('Failed to create zip:', e.message);
}
