import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../downloaded-images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Images to download
const images = {
    homepage: {
        hero: 'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b5a41a83bb0532fc41cc4b_Untitled%20design%20(3).png',
        logos: [
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1b40ff8f7a47bdc773d76_logo-01-inverse.svg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1b40ff8f7a47bdc773d7a_logo-02-inverse.svg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1b40ff8f7a47bdc773d78_logo-03-inverse.svg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1b40ff8f7a47bdc773d77_logo-04-inverse.svg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1b40ff8f7a47bdc773d79_logo-05-inverse.svg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1b40ff8f7a47bdc773d7b_logo-06-inverse.svg',
        ]
    },
    about: {
        hero: 'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b592a65c3246fa69828f1c_8b610089be5d9bab8d399ebb1ebccb88_Anfasic.png',
        gallery: [
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b593fcde43b18443f7877d_Anfasic%20(2).png',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b5a31485e4bd76b40ced6a_80c0ecbe-42e7-4c1d-b11c-1c35440bd46c.jpg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b5949894a8dc415ef2350d_Anfasic%20(3).png',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b1badf77c2d7942bfdf12f_IMG_4682.jpeg',
            'https://cdn.prod.website-files.com/68b1b40df8f7a47bdc773adf/68b5930ddfdc84328d793fb2_Anfasic%20(1).png',
        ]
    }
};

/**
 * Download a file from URL
 */
function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${path.basename(outputPath)}`);
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(outputPath, () => { });
            reject(err);
        });
    });
}

/**
 * Main download function
 */
async function downloadAllImages() {
    console.log('Starting image downloads...\n');

    try {
        // Download homepage hero
        console.log('Homepage Hero:');
        const heroPath = path.join(OUTPUT_DIR, 'homepage-hero.png');
        await downloadFile(images.homepage.hero, heroPath);

        // Download partner logos
        console.log('\nPartner Logos:');
        for (let i = 0; i < images.homepage.logos.length; i++) {
            const logoPath = path.join(OUTPUT_DIR, `partner-logo-${i + 1}.svg`);
            await downloadFile(images.homepage.logos[i], logoPath);
        }

        // Download about page hero
        console.log('\nAbout Page Hero:');
        const aboutHeroPath = path.join(OUTPUT_DIR, 'about-hero.png');
        await downloadFile(images.about.hero, aboutHeroPath);

        // Download about page gallery
        console.log('\nAbout Page Gallery:');
        for (let i = 0; i < images.about.gallery.length; i++) {
            const url = images.about.gallery[i];
            const ext = path.extname(new URL(url).pathname);
            const galleryPath = path.join(OUTPUT_DIR, `about-gallery-${i + 1}${ext || '.png'}`);
            await downloadFile(url, galleryPath);
        }

        console.log('\n✅ All images downloaded successfully!');
        console.log(`📁 Images saved to: ${OUTPUT_DIR}`);

    } catch (error) {
        console.error('❌ Error downloading images:', error);
        process.exit(1);
    }
}

downloadAllImages();
