import React from 'react';
import { PrismicRichText } from '@prismicio/react';
import { PrismicLink } from '@prismicio/react';

export default function WorkGrid({ slice }) {
    return (
        <section className="work-grid-section py-20 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
                <div className="text-3xl font-serif mb-4">
                    <PrismicRichText field={slice.primary.title} />
                </div>
                <div className="text-gray-400 max-w-2xl">
                    <PrismicRichText field={slice.primary.description} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {slice.items.map((item, i) => {
                    const work = item.work_item;
                    // Check if the linked document has data (it should if fetchLinks is used)
                    if (!work || !work.data) return null;

                    return (
                        <div key={i} className="group relative">
                            <a href={`/work/${work.uid}`} className="block">
                                <div className="relative overflow-hidden aspect-[4/3] mb-4 bg-gray-900 rounded-lg">
                                    {work.data.main_image?.url ? (
                                        <img
                                            src={work.data.main_image.url}
                                            alt={work.data.main_image.alt || ''}
                                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                                </div>

                                <h3 className="text-xl font-serif mb-1 group-hover:text-purple-400 transition-colors">
                                    {work.data.title?.[0]?.text || 'Untitled Project'}
                                </h3>
                                <div className="flex justify-between items-center text-sm text-gray-500 uppercase tracking-widest">
                                    <span>{work.data.category || 'Category'}</span>
                                    <span>{work.data.year || 'Year'}</span>
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
