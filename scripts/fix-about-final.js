
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const content = `---
import Layout from "../layouts/Layout.astro";
import { client } from "../lib/prismic";
import { PrismicRichText } from "@prismicio/react";

let page;
try {
    page = await client.getSingle("about");
} catch (e) {
    console.error("About page fetch failed:", e);
}

const { hero_image, intro, professional_photos, experience, skills } =
    page?.data || {};
---

<Layout title="About | Rima Alshoufi">
    <main class="pt-32 px-8 md:px-12 max-w-4xl mx-auto pb-48">
        <header class="mb-24">
            <h2
                class="text-xs uppercase tracking-[0.4em] mb-4 text-gray-500 font-light translate-y-4 animate-fade-in-up"
            >
                Biography
            </h2>
            <div class="animate-fade-in-up delay-100 mb-8">
                <PrismicRichText
                    field={page?.data?.title}
                    components={{
                        heading1: ({ children }) => (
                            <h1 class="text-6xl md:text-8xl font-serif leading-tight tracking-tighter">
                                {children}
                            </h1>
                        ),
                    }}
                />
            </div>

            {hero_image?.url && (
                <div class="mb-16 animate-fade-in-up delay-200">
                    <img src={hero_image.url} alt={hero_image.alt || ""} class="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
            )}
        </header>

        <div
            class="space-y-12 text-xl md:text-2xl font-light leading-relaxed text-gray-300 animate-fade-in-up delay-200"
        >
            <PrismicRichText field={intro} />
            <div class="h-1 w-20 bg-white/10 my-16"></div>
            <PrismicRichText field={experience} />
        </div>

        {/* Gallery */}
        {professional_photos?.length > 0 && (
            <div class="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up delay-300">
                {professional_photos.map((item: any) => item.image?.url && (
                    <div class="relative group overflow-hidden">
                        <img src={item.image.url} alt={item.image.alt || ""} class="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-60 hover:opacity-100" />
                    </div>
                ))}
            </div>
        )}

        <div
            class="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 animate-fade-in-up delay-300"
        >
            <div>
                <h3
                    class="text-sm uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4"
                >
                    Specializations & Skills
                </h3>
                <ul class="space-y-4 text-gray-500 text-base">
                    {skills?.map((item: any) => <li>{item.skill}</li>)}
                </ul>
            </div>
            <div>
                <h3
                    class="text-sm uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4"
                >
                    Approach
                </h3>
                <p class="text-gray-500 text-base leading-relaxed">
                    Merging data-driven insights with intuitive creativity to
                    build environments that resonate emotionally while achieving
                    commercial excellence.
                </p>
            </div>
        </div>
    </main>
</Layout>

<style>
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in-up {
        animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        opacity: 0;
    }
    .delay-100 {
        animation-delay: 0.1s;
    }
    .delay-200 {
        animation-delay: 0.2s;
    }
    .delay-300 {
        animation-delay: 0.3s;
    }
</style>
`;

fs.writeFileSync(path.join(__dirname, '../src/pages/about.astro'), content);
console.log("File fixed successfully!");
