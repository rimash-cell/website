import React from 'react';
import { PrismicRichText } from '@prismicio/react';

export default function ContentBlock({ slice }) {
    return (
        <section className="content-block py-12 px-4 md:px-8 max-w-4xl mx-auto prose prose-invert prose-lg">
            <PrismicRichText field={slice.primary.content} />
        </section>
    );
}
