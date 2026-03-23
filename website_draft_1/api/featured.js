import { getAllWorkDocuments } from './_prismic.js';

export default async (req, res) => {
    try {
        const allProjects = await getAllWorkDocuments();
        let results = allProjects.filter((project) => project?.data?.featured_home1 === true);

        if (results.length === 0) {
            results = allProjects.slice(0, 3);
        }

        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Unable to load featured projects' });
    }
}
