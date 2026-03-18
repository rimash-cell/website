
import { createClient } from '@prismicio/client';
import fetch from 'node-fetch';

const client = createClient('rima', {
    fetch
});

async function checkAbout() {
    try {
        console.log("Fetching 'about' document...");
        const doc = await client.getSingle('about');
        console.log("Success! Found document ID:", doc.id);
        console.log("Data keys:", Object.keys(doc.data));
        if (doc.data.hero_image) {
            console.log("Hero Image:", doc.data.hero_image);
        } else {
            console.log("Hero Image is MISSING in data.");
        }
    } catch (error) {
        console.error("Error fetching 'about':", error.message);
    }
}

checkAbout();
