import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
    console.log('Starting headless browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // URL of the local astro print page
    const url = 'http://localhost:4321/pdf/kht-case-study';

    console.log(`Navigating to ${url}...`);
    // Wait until network is idle to ensure images load
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Output path
    const outputPath = path.resolve('public/projects/kht-the-perfumers/The_Perfumers_Case_Study.pdf');

    console.log(`Rendering PDF...`);
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true, // ensure background colors and dark modes show
        margin: {
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px'
        }
    });

    await browser.close();
    console.log(`PDF successfully generated at: ${outputPath}`);
})();
