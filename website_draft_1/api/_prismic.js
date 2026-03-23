const API_VERSION = 'v2';

function getConfig() {
    const repo = process.env.PRISMIC_REPO || 'rima';
    const token = process.env.PRISMIC_ACCESS_TOKEN;

    if (!token) {
        throw new Error('Missing PRISMIC_ACCESS_TOKEN');
    }

    return { repo, token };
}

async function prismicFetch(path, params = {}) {
    const { repo, token } = getConfig();
    const searchParams = new URLSearchParams(params);
    searchParams.set('access_token', token);
    const url = `https://${repo}.cdn.prismic.io/api/${API_VERSION}${path}?${searchParams.toString()}`;

    const response = await fetch(url, {
        headers: {
            Accept: 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Prismic request failed with ${response.status}`);
    }

    return response.json();
}

async function getMasterRef() {
    const data = await prismicFetch('');
    const ref = data?.refs?.[0]?.ref;

    if (!ref) {
        throw new Error('Unable to resolve Prismic ref');
    }

    return ref;
}

async function getAllWorkDocuments() {
    const ref = await getMasterRef();
    const data = await prismicFetch('/documents/search', {
        ref,
        pageSize: '100',
        q: '[[at(document.type,"work")]]'
    });

    const results = Array.isArray(data?.results) ? data.results : [];
    results.sort((a, b) => (a?.data?.sort_order ?? 9999) - (b?.data?.sort_order ?? 9999));
    return results;
}

async function getWorkByUid(uid) {
    const ref = await getMasterRef();
    return prismicFetch('/documents/search', {
        ref,
        q: `[[at(my.work.uid,"${uid}")]]`
    });
}

async function getLinkedWorkByIds(ids) {
    const cleanIds = ids.filter(Boolean);
    if (cleanIds.length === 0) {
        return { results: [] };
    }

    const ref = await getMasterRef();
    return prismicFetch('/documents/search', {
        ref,
        q: `[[in(document.id,[${cleanIds.map((id) => `"${id}"`).join(',')}])]]`
    });
}

export {
    getAllWorkDocuments,
    getLinkedWorkByIds,
    getWorkByUid
};
