import React from 'react';

export default function ImageGallery({ slice }) {
    return (
        <section className="image-gallery py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {slice.items.map((item, i) => (
                    <div key={i} className="mb-8">
                        {item.image.url && (
                            <img
                                src={item.image.url}
                                alt={item.image.alt || ''}
                                className="w-full h-auto rounded-lg shadow-lg mb-2"
                            />
                        )}
                        {item.caption && (
                            <p className="text-sm text-gray-500 italic">{item.caption}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
