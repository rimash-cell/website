import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getLinkedWorkByIds, getWorkByUid } from './_prismic.js';

const SITE_URL = 'https://rimaalshoufi.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image-v3.jpg`;

function loadTemplate() {
    return readFileSync(join(process.cwd(), 'project_view.html'), 'utf8');
}

const PROJECT_TEMPLATE = loadTemplate();

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[char]));

function getText(field) {
    if (!field) return '';
    if (typeof field === 'string') return field.trim();
    if (Array.isArray(field)) {
        return field.map((block) => block?.text || '').join(' ').replace(/\s+/g, ' ').trim();
    }
    return typeof field?.text === 'string' ? field.text.trim() : '';
}

function truncate(value, max = 170) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length <= max ? text : `${text.slice(0, max - 1).trim()}...`;
}

function titleOf(data) {
    return data?.project_title || getText(data?.title) || 'Project';
}

function categoryOf(data) {
    const intro = data?.intro?.[0]?.text || '';
    return data?.project_category || data?.type || data?.category || intro.split('|')[0]?.trim() || 'Spatial Experience';
}

function subcategoryOf(data) {
    const intro = data?.intro?.[0]?.text || '';
    return data?.project_subcategory || intro.split('|')[1]?.trim() || '';
}

function summaryOf(data) {
    return getText(data?.project_essence) || getText(data?.intro) || getText(data?.concept_narrative) || getText(data?.concept_body) || 'Selected project case study.';
}

function heroImageOf(data) {
    return data?.hero_image?.url || data?.main_image?.url || data?.preview_image?.url || '';
}

function jsonLd(title, description, canonicalUrl, imageUrl) {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CreativeWork',
                name: title,
                description,
                url: canonicalUrl,
                image: imageUrl
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                    { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_URL}/work` },
                    { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl }
                ]
            }
        ]
    });
}

function notFoundPage(uid) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Project Not Found | Rima Alshoufi</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#f7f5f2;font-family:"Hanken Grotesk",sans-serif}main{width:min(90vw,640px);padding:40px;border:1px solid rgba(255,255,255,.12)}a{color:#f7f5f2}</style></head><body><main><h1>Project not found</h1><p>The project <strong>${escapeHtml(uid)}</strong> could not be loaded right now.</p><p><a href="/work">Back to selected work</a></p></main></body></html>`;
}

function buildPage(uid, data, linkedResults = []) {
    const title = titleOf(data);
    const category = categoryOf(data);
    const subcategory = subcategoryOf(data);
    const summary = summaryOf(data);
    const canonicalUrl = `${SITE_URL}/projects/${encodeURIComponent(uid)}`;
    const imageUrl = heroImageOf(data) || DEFAULT_OG_IMAGE;
    const description = truncate(`${title}. ${subcategory ? `${subcategory}, ` : ''}${category}. ${summary} Spatial experience and creative direction in Dubai and the GCC.`);
    const bootstrapScript = `<script>window.__PROJECT_UID__=${JSON.stringify(uid)};window.__PROJECT_CANONICAL__=${JSON.stringify(canonicalUrl)};window.__PROJECT_DATA__=${JSON.stringify(data)};window.__PROJECT_LINKED__=${JSON.stringify(linkedResults)};</script>`;
    const structuredData = `<script type="application/ld+json">${jsonLd(title, description, canonicalUrl, imageUrl)}</script>`;

    return PROJECT_TEMPLATE
        .replace('<title>Project | Rima Alshoufi</title>', `<title>${escapeHtml(title)} | Rima Alshoufi</title>`)
        .replace('content="Legacy project view for Rima Alshoufi. Use the main work archive to browse current case studies."', `content="${escapeHtml(description)}"`)
        .replace('<meta name="robots" content="noindex, nofollow">', '<meta name="robots" content="index, follow, max-image-preview:large">')
        .replace('<meta name="googlebot" content="noindex, nofollow">', '<meta name="googlebot" content="index, follow, max-image-preview:large">')
        .replace('<link rel="canonical" href="https://rimaalshoufi.com/work">', `<link rel="canonical" href="${canonicalUrl}">`)
        .replace('<meta property="og:title" content="Project | Rima Alshoufi">', `<meta property="og:title" content="${escapeHtml(title)} | Rima Alshoufi">`)
        .replace('<meta property="og:description" content="Project by Rima Alshoufi, spatial experience designer based in Dubai.">', `<meta property="og:description" content="${escapeHtml(description)}">`)
        .replace('<meta property="og:url" content="https://rimaalshoufi.com/project_view.html">', `<meta property="og:url" content="${canonicalUrl}">`)
        .replace('<meta property="og:image" content="https://rimaalshoufi.com/og-image-v3.jpg">', `<meta property="og:image" content="${escapeHtml(imageUrl)}">`)
        .replace('<meta name="twitter:title" content="Project | Rima Alshoufi">', `<meta name="twitter:title" content="${escapeHtml(title)} | Rima Alshoufi">`)
        .replace('<meta name="twitter:description" content="Project by Rima Alshoufi, spatial experience designer based in Dubai.">', `<meta name="twitter:description" content="${escapeHtml(description)}">`)
        .replace('<meta name="twitter:image" content="https://rimaalshoufi.com/og-image-v3.jpg">', `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">`)
        .replace('    <script>', `    ${structuredData}\n    ${bootstrapScript}\n    <script>`)
        .replace(
            "            const uid = new URLSearchParams(window.location.search).get('uid');",
            "            const uid = window.__PROJECT_UID__ || new URLSearchParams(window.location.search).get('uid') || (() => { const match = window.location.pathname.match(/^\\/projects\\/([^/?#]+)/); return match ? decodeURIComponent(match[1]) : ''; })();"
        )
        .replace(
            "                const docRes = await fetch(`/api/project?uid=${encodeURIComponent(uid)}`);\n                if (!docRes.ok) throw new Error('Not found');\n                const docData = await docRes.json();\n                if (!docData.results || docData.results.length === 0) throw new Error('Not found');\n\n                const d = docData.results[0].data;",
            "                const docData = window.__PROJECT_DATA__ ? { results: [{ data: window.__PROJECT_DATA__ }] } : await (async () => {\n                    const docRes = await fetch(`/api/project?uid=${encodeURIComponent(uid)}`);\n                    if (!docRes.ok) throw new Error('Not found');\n                    return docRes.json();\n                })();\n                if (!docData.results || docData.results.length === 0) throw new Error('Not found');\n\n                const d = docData.results[0].data;"
        )
        .replace(
            "                            const linkedRes = await fetch(`/api/linked?ids=${encodeURIComponent(linkIds.join(','))}`);\n                            const linkedData = await linkedRes.json();\n                            const linkedMap = {};\n                            linkedData.results.forEach(r => { linkedMap[r.id] = r; });",
            "                            const linkedData = (window.__PROJECT_LINKED__ && window.__PROJECT_LINKED__.length > 0)\n                                ? { results: window.__PROJECT_LINKED__ }\n                                : await (async () => {\n                                    const linkedRes = await fetch(`/api/linked?ids=${encodeURIComponent(linkIds.join(','))}`);\n                                    return linkedRes.json();\n                                })();\n                            const linkedMap = {};\n                            linkedData.results.forEach(r => { linkedMap[r.id] = r; });"
        )
        .replace(
            "                document.title = `${title} | Rima Alshoufi`;",
            "                document.title = `${title} | Rima Alshoufi`;\n                const canonicalEl = document.querySelector('link[rel=\"canonical\"]');\n                if (canonicalEl && window.__PROJECT_CANONICAL__) canonicalEl.href = window.__PROJECT_CANONICAL__;"
        );
}

export default async function handler(req, res) {
    const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : '';
    if (!uid) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(400).send(notFoundPage(''));
        return;
    }

    try {
        const result = await getWorkByUid(uid);
        const project = result?.results?.[0];
        if (!project?.data) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(404).send(notFoundPage(uid));
            return;
        }

        const linkedIds = [project.data?.prev_project?.id, project.data?.next_project?.id].filter(Boolean);
        let linkedResults = [];
        if (linkedIds.length > 0) {
            try {
                const linked = await getLinkedWorkByIds(linkedIds);
                linkedResults = linked?.results || [];
            } catch (error) {
                console.warn('Project page linked preload failed:', error);
            }
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        res.status(200).send(buildPage(uid, project.data, linkedResults));
    } catch (error) {
        console.error('Project page render failed:', error);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(500).send(notFoundPage(uid));
    }
}
