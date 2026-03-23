import { getWorkByUid } from './_prismic.js';

export default async (req, res) => {
    const uid = typeof req.query.uid === 'string' ? req.query.uid.trim() : '';

    if (!uid) {
        res.status(400).json({ error: 'Missing uid' });
        return;
    }

    try {
        const results = await getWorkByUid(uid);
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Unable to load project' });
    }
}
