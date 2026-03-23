import { getAllWorkDocuments } from './_prismic.js';

export default async (req, res) => {
    try {
        const results = await getAllWorkDocuments();
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Unable to load projects' });
    }
}
