import { getAllWorkDocuments } from './_prismic.js';

const SITE_URL = 'https://rimaalshoufi.com';
const STATIC_PAGES = [
    '/',
    '/work',
    '/connect',
    '/luxury-retail',
    '/hospitality',
    '/immersive-experiences'
];

function toIsoDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
    }

    return date.toISOString().split('T')[0];
}

function buildUrlEntry(path, lastmod) {
    return [
        '  <url>',
        `    <loc>${SITE_URL}${path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '  </url>'
    ].join('\n');
}

export default async function handler(req, res) {
    const entries = STATIC_PAGES.map((path) => buildUrlEntry(path, toIsoDate()));

    try {
        const projects = await getAllWorkDocuments();

        projects
            .filter((project) => project?.uid)
            .forEach((project) => {
                entries.push(
                    buildUrlEntry(
                        `/projects/${encodeURIComponent(project.uid)}`,
                        toIsoDate(project.last_publication_date || project.first_publication_date)
                    )
                );
            });
    } catch (error) {
        console.error('Sitemap generation failed, serving static entries only.', error);
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(200).send(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            entries.join('\n'),
            '</urlset>'
        ].join('\n')
    );
}
