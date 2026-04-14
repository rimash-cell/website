import React from 'react';
import { PrismicRichText } from '@prismicio/react';

export default function Hero({ slice }: any) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32">
            <div className="container mx-auto px-8 md:px-12 z-10 relative">
                <div className="max-w-5xl">
                    <div className="h-1 w-20 bg-white/20 mb-12"></div>
                    <div className="text-5xl md:text-[7vw] font-serif leading-[0.95] mb-12 tracking-tighter">
                        <PrismicRichText field={slice.primary.title} />
                    </div>
                    <div className="text-lg md:text-2xl text-gray-400 font-light max-w-2xl leading-relaxed uppercase tracking-wider">
                        <PrismicRichText field={slice.primary.description} />
                    </div>
                </div>
            </div>

            {slice.primary.video_url || slice.primary.video_file?.url ? (
                <div className="absolute inset-0 -z-10">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-40"
                    >
                        <source src={slice.primary.video_url || slice.primary.video_file?.url} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
                </div>
            ) : slice.primary.image?.url && (
                <div className="absolute inset-0 -z-10">
                    <img
                        src={slice.primary.image.url}
                        alt={slice.primary.image.alt || ''}
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>
                </div>
            )}
        </section>
    );
}
