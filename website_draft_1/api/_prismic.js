const API_VERSION = 'v2';
const REF_TTL_MS = 5 * 60 * 1000;
const DOCS_TTL_MS = 5 * 60 * 1000;
const UID_TTL_MS = 5 * 60 * 1000;

let refCache = { value: '', expiresAt: 0 };
let allWorkCache = { value: null, expiresAt: 0 };
const uidCache = new Map();

function now() {
    return Date.now();
}

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
    if (refCache.value && refCache.expiresAt > now()) {
        return refCache.value;
    }

    const data = await prismicFetch('');
    const ref = data?.refs?.[0]?.ref;

    if (!ref) {
        throw new Error('Unable to resolve Prismic ref');
    }

    refCache = {
        value: ref,
        expiresAt: now() + REF_TTL_MS
    };

    return ref;
}

async function getAllWorkDocuments() {
    if (allWorkCache.value && allWorkCache.expiresAt > now()) {
        return allWorkCache.value;
    }

    const ref = await getMasterRef();
    const data = await prismicFetch('/documents/search', {
        ref,
        pageSize: '100',
        q: '[[at(document.type,"work")]]'
    });

    const results = Array.isArray(data?.results) ? data.results : [];
    results.sort((a, b) => (a?.data?.sort_order ?? 9999) - (b?.data?.sort_order ?? 9999));

    allWorkCache = {
        value: results,
        expiresAt: now() + DOCS_TTL_MS
    };

    return results;
}

async function getWorkByUid(uid) {
    const cached = uidCache.get(uid);
    if (cached && cached.expiresAt > now()) {
        return cached.value;
    }

    const allDocs = await getAllWorkDocuments();
    const matchedFromAll = allDocs.find((doc) => doc?.uid === uid);
    if (matchedFromAll) {
        const result = { results: [matchedFromAll] };
        uidCache.set(uid, { value: result, expiresAt: now() + UID_TTL_MS });
        return result;
    }

    const ref = await getMasterRef();
    const result = await prismicFetch('/documents/search', {
        ref,
        q: `[[at(my.work.uid,"${uid}")]]`
    });
    uidCache.set(uid, { value: result, expiresAt: now() + UID_TTL_MS });
    return result;
}

async function getLinkedWorkByIds(ids) {
    const cleanIds = ids.filter(Boolean);
    if (cleanIds.length === 0) {
        return { results: [] };
    }

    const allDocs = await getAllWorkDocuments();
    const byId = new Map(allDocs.map((doc) => [doc?.id, doc]));
    const matched = cleanIds.map((id) => byId.get(id)).filter(Boolean);
    if (matched.length === cleanIds.length) {
        return { results: matched };
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
