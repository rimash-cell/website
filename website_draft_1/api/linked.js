import { getLinkedWorkByIds } from './_prismic.js';

export default async (req, res) => {
    const ids = typeof req.query.ids === 'string'
        ? req.query.ids.split(',').map((value) => value.trim()).filter(Boolean)
        : [];

    try {
        const results = await getLinkedWorkByIds(ids);
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Unable to load related projects' });
    }
}
