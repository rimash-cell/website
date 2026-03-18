import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_NAME = 'rima';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InJpbWEtYmY1MGZlZTAtMmQ5MC00MDg1LWJhNGUtOTNjMjMyZTQ3MTc0XzUiLCJkYXRlIjoxNzY3ODE2Mzc5LCJkb21haW4iOiJyaW1hIiwiYXBwTmFtZSI6ImFpLWFnZW50IiwiaWF0IjoxNzY3ODE2Mzc5fQ.yRmJo_s6uM7yDY7ezNneLctl3YGsje_24P082aT83hI';
const IMAGES_DIR = path.join(__dirname, '../downloaded-images');

/**
 * Upload an image to Prismic's asset API
 */
async function uploadImageToPrismic(imagePath, filename) {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath), filename);

    const response = await fetch(`https://asset-api.prismic.io/assets?repo=${REPO_NAME}`, {
        method: 'POST',
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            ...form.getHeaders()
        },
        body: form
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to upload ${filename}: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`✓ Uploaded: ${filename}`);
    return data;
}

/**
 * Get or create homepage document
 */
async function getOrCreateHomepage() {
    // Try to fetch existing homepage
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    if (!apiResponse.ok) throw new Error(`Failed to init API: ${apiResponse.status}`);

    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"homepage")]]`
    );

    if (!response.ok) throw new Error(`Failed to fetch homepage: ${response.status}`);
    const data = await response.json();

    if (data.results.length > 0) {
        return data.results[0];
    }

    console.log('No homepage document found. Please create one in Prismic first.');
    return null;
}

/**
 * Get or create about page document
 */
async function getOrCreateAbout() {
    const apiResponse = await fetch(`https://${REPO_NAME}.cdn.prismic.io/api/v2?access_token=${TOKEN}`);
    if (!apiResponse.ok) throw new Error(`Failed to init API: ${apiResponse.status}`);

    const apiData = await apiResponse.json();
    const ref = apiData.refs[0].ref;

    const response = await fetch(
        `https://${REPO_NAME}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&q=[[at(document.type,"about")]]`
    );

    if (!response.ok) throw new Error(`Failed to fetch about: ${response.status}`);
    const data = await response.json();

    if (data.results.length > 0) {
        return data.results[0];
    }

    console.log('No about document found. Please create one in Prismic first.');
    return null;
}

/**
 * Update document via Migration API
 */
async function updateDocument(docId, data) {
    const url = `https://migration.prismic.io/documents/${docId}`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'repository': REPO_NAME,
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (response.status === 429) {
        console.log('Rate limited, waiting...');
        await new Promise(r => setTimeout(r, 2000));
        return updateDocument(docId, data);
    }

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(`Failed to update document: ${JSON.stringify(error)}`);
    }

    return response.json();
}

async function main() {
    console.log('Starting image upload to Prismic...\n');

    try {
        // Upload homepage hero
        console.log('1. Uploading Homepage Hero Image...');
        const homepageHero = await uploadImageToPrismic(
            path.join(IMAGES_DIR, 'homepage-hero.png'),
            'homepage-hero.png'
        );

        // Upload partner logos
        console.log('\n2. Uploading Partner Logos...');
        const partnerLogos = [];
        for (let i = 1; i <= 6; i++) {
            const logo = await uploadImageToPrismic(
                path.join(IMAGES_DIR, `partner-logo-${i}.svg`),
                `partner-logo-${i}.svg`
            );
            partnerLogos.push(logo);
            await new Promise(r => setTimeout(r, 500)); // Rate limit safety
        }

        // Upload about page hero
        console.log('\n3. Uploading About Page Hero...');
        const aboutHero = await uploadImageToPrismic(
            path.join(IMAGES_DIR, 'about-hero.png'),
            'about-hero.png'
        );

        // Upload about gallery images
        console.log('\n4. Uploading About Gallery Images...');
        const aboutGallery = [];
        const galleryFiles = [
            'about-gallery-1.png',
            'about-gallery-2.jpg',
            'about-gallery-3.png',
            'about-gallery-4.jpeg',
            'about-gallery-5.png'
        ];

        for (const filename of galleryFiles) {
            const image = await uploadImageToPrismic(
                path.join(IMAGES_DIR, filename),
                filename
            );
            aboutGallery.push(image);
            await new Promise(r => setTimeout(r, 500));
        }

        // Update homepage document
        console.log('\n5. Updating Homepage Document...');
        const homepageDoc = await getOrCreateHomepage();
        if (homepageDoc) {
            const updatedData = {
                ...homepageDoc.data,
                hero_image: {
                    id: homepageHero.id,
                    url: homepageHero.url,
                    alt: 'Rima Alshoufi - Creative Director',
                    dimensions: homepageHero.dimensions || { width: homepageHero.width, height: homepageHero.height }
                },
                // Partner logos will be added manually in Prismic after schema sync
                // partner_logos: partnerLogos.map((logo, index) => ({
                //     logo: {
                //         id: logo.id,
                //         url: logo.url,
                //         alt: logo.name || `Partner ${index + 1}`,
                //         dimensions: logo.dimensions || { width: logo.width, height: logo.height }
                //     },
                //     name: `Partner ${index + 1}`
                // }))
            };

            await updateDocument(homepageDoc.id, {
                title: homepageDoc.data.title?.[0]?.text || 'Homepage',
                type: homepageDoc.type,
                uid: homepageDoc.uid,
                lang: homepageDoc.lang,
                data: updatedData
            });
            console.log('✓ Homepage updated successfully');
            console.log('  Note: Partner logos uploaded to CDN but need to be added manually in Prismic UI');
            console.log('  Partner logo URLs saved for reference:');
            partnerLogos.forEach((logo, i) => {
                console.log(`  ${i + 1}. ${logo.url}`);
            });
        }

        // Update about page document
        console.log('\n6. Updating About Page Document...');
        const aboutDoc = await getOrCreateAbout();
        if (aboutDoc) {
            const updatedData = {
                ...aboutDoc.data,
                hero_image: {
                    id: aboutHero.id,
                    url: aboutHero.url,
                    alt: 'Rima Alshoufi - Portrait',
                    dimensions: aboutHero.dimensions || { width: aboutHero.width, height: aboutHero.height }
                },
                // Professional photos will be added manually in Prismic after schema sync
                // professional_photos: aboutGallery.map((photo, index) => ({
                //     image: {
                //         id: photo.id,
                //         url: photo.url,
                //         alt: `Professional photo ${index + 1}`,
                //         dimensions: photo.dimensions || { width: photo.width, height: photo.height }
                //     },
                //     caption: ''
                // }))
            };

            await updateDocument(aboutDoc.id, {
                title: aboutDoc.data.title?.[0]?.text || 'About',
                type: aboutDoc.type,
                uid: aboutDoc.uid,
                lang: aboutDoc.lang,
                data: updatedData
            });
            console.log('✓ About page updated successfully');
            console.log('  Note: Gallery photos uploaded to CDN but need to be added manually in Prismic UI');
            console.log('  Gallery photo URLs saved for reference:');
            aboutGallery.forEach((photo, i) => {
                console.log(`  ${i + 1}. ${photo.url}`);
            });
        }

        console.log('\n✅ All images uploaded and documents updated!');
        console.log('\nNext Steps:');
        console.log('1. Push custom type changes to Prismic: npx slicemachine');
        console.log('2. Check your Prismic dashboard to verify the images');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
