import * as prismic from '@prismicio/client';
import dotenv from 'dotenv';
dotenv.config();

const repositoryName = 'rima';
const client = prismic.createClient(repositoryName, {
  accessToken: process.env.PRISMIC_ACCESS_TOKEN,
});

async function check() {
  try {
    const work = await client.getByUID('work', 'emovation-lab', { lang: '*' });
    console.log('--- Prismic Data ---');
    console.log('UID:', work.uid);
    console.log('Title:', work.data.title?.[0]?.text);
    console.log('Category:', work.data.category);
    console.log('Last Publication Date:', work.last_publication_date);
    // console.log('Data:', JSON.stringify(work.data, null, 2));
  } catch (e) {
    console.error('Error fetching from Prismic:', e);
  }
}

check();
