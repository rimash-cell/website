import React, { useState, useMemo } from 'react';

export default function ProjectList({ initialWorks }) {
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Extract unique categories, remove null/undefined, and add "All"
    const categories = useMemo(() => {
        const cats = new Set(
            initialWorks
                .map((work) => work.data.category)
                .filter((c) => c)
        );
        return ["All", ...Array.from(cats)];
    }, [initialWorks]);

    // Filter works based on selection
    const filteredWorks = useMemo(() => {
        if (selectedCategory === "All") return initialWorks;
        return initialWorks.filter(
            (work) => work.data.category === selectedCategory
        );
    }, [selectedCategory, initialWorks]);

    return (
        <>
            <header className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8 pt-16">
                <div>
                    <h2 className="sec-tag mb-8" style={{ marginTop: 0 }}>
                        Portfolio
                    </h2>
                    <h1 className="text-5xl md:text-7xl mb-8 leading-[1.1] tracking-[-0.02em] animate-fade-in-up delay-100 text-black font-light">
                        Selected Works
                    </h1>
                    <p className="text-black/60 max-w-2xl text-[18px] md:text-[20px] font-light leading-[1.8] animate-fade-in-up delay-200">
                        A curation of luxury retail concepts, bespoke interiors, and
                        experiential spaces designed to evoke emotion and define brand
                        identity.
                    </p>
                </div>

                {/* Horizontal Filter List */}
                <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-full text-[11px] uppercase tracking-[0.15em] transition-all duration-300 border font-medium ${selectedCategory === category
                                ? 'bg-black border-black text-white'
                                : 'bg-transparent border-black/10 text-black/50 hover:border-black hover:text-black'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                {filteredWorks.length > 0 ? (
                    filteredWorks.map((work, i) => (
                        <a
                            key={work.uid}
                            href={`/projects/${work.uid}`}
                            className={`work-card animate-fade-in-up ${i % 2 !== 0 ? 'work-card-offset' : ''}`}
                            style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                        >
                            {/* Image */}
                            <div
                                className="work-img"
                                style={work.data.main_image?.url ? { backgroundImage: `url('${work.data.main_image.url}')` } : {}}
                            >
                                <span className="work-img-l">{work.data.title?.[0]?.text || "Untitled"}</span>
                            </div>

                            {/* Meta */}
                            <div className="work-info">
                                <div className="work-meta">{work.data.category || 'Architecture'}</div>
                                <div className="work-title">
                                    {work.data.title?.[0]?.text || "Untitled"}
                                </div>
                                <div style={{ fontSize: '11px', letterSpacing: '0.15em', opacity: 0.5, fontWeight: 500, textTransform: 'uppercase', marginBottom: '12px' }}>{work.data.year}</div>
                                <div className="work-truth">Set a new benchmark for narrative retail architecture.</div>
                                <div className="work-cta"><span>View Project</span> <i style={{ fontStyle: 'normal', marginLeft: '12px' }}>→</i></div>
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 py-32 border-t border-black/10 flex flex-col items-center text-center">
                        <p className="text-black/60 uppercase tracking-[0.2em] text-[11px] font-medium mb-8">
                            No projects found in this category
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
