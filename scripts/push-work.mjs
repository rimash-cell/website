import fs from 'fs';
import path from 'path';

const REPO_NAME = 'rima';
const TOKEN = process.env.PRISMIC_TOKEN;

if (!TOKEN) {
  console.error('PRISMIC_TOKEN env var is required');
  process.exit(1);
}

async function pushWork() {
  const id = 'work';
  const filePath = path.join(process.cwd(), 'customtypes', id, 'index.json');
  if (!fs.existsSync(filePath)) {
    console.error('Custom type file not found:', filePath);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const url = `https://customtypes.prismic.io/customtypes/${id}`;
  console.log('PUT', url);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      repository: REPO_NAME,
      Authorization: TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(content)
  });

  if (!res.ok) {
    console.error('Update failed:', await res.text());
    process.exit(1);
  }
  console.log('Update successful.');

  const final = await fetch(url, { headers: { repository: REPO_NAME, Authorization: TOKEN } });
  if (final.ok) {
    const data = await final.json();
    console.log('\nResulting custom type (top-level fields):');
    if (data && data.json && data.json.Main) {
      console.log(Object.keys(data.json.Main));
    } else {
      console.log('Unable to read returned structure.');
    }
  } else {
    console.error('Failed to fetch resulting type:', await final.text());
  }
}

pushWork().catch(err => { console.error(err); process.exit(1); });
