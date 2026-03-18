import fs from 'fs';
import path from 'path';

// Helper to safely parse CSV line
function parseCSVLine(line) {
    const result = [];
    let start = 0;
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            let field = line.substring(start, i);
            // Remove surrounding quotes and unescape double quotes
            if (field.startsWith('"') && field.endsWith('"')) {
                field = field.slice(1, -1).replace(/""/g, '"');
            }
            result.push(field);
            start = i + 1;
        }
    }
    // Push last field
    let lastField = line.substring(start);
    if (lastField.startsWith('"') && lastField.endsWith('"')) {
        lastField = lastField.slice(1, -1).replace(/""/g, '"');
    }
    result.push(lastField);
    return result;
}

const csvPath = path.resolve(process.cwd(), "Rima Alshoufi's Portfolio - Works.csv");
const fileContent = fs.readFileSync(csvPath, 'utf-8');

const lines = fileContent.split('\n');
const headers = parseCSVLine(lines[0]);

const works = [];

for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const currentLine = parseCSVLine(lines[i]);
    const data = {};

    headers.forEach((header, index) => {
        data[header.trim()] = currentLine[index];
    });

    // Transform to Prismic format
    if (data['Name']) {
        const prismicDoc = {
            type: "work",
            uid: data['Slug'] || data['Name'].toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            lang: "en-us",
            data: {
                title: [
                    {
                        type: "heading1",
                        text: data['Name'],
                        spans: []
                    }
                ],
                category: data['Category'] || "Other", // Needs to match select options exactly or be text. Using select in model so might need adjusting.
                client: data['Client'],
                year: data['Year'],
                location: data['Location'],
                intro: [
                    {
                        type: "paragraph",
                        text: data['Intro'] || "",
                        spans: []
                    }
                ],
                main_image: {
                    origin: {
                        url: data['Main Image']
                    },
                    url: data['Main Image']
                },
                preview_image: {
                    origin: {
                        url: data['Preview Image']
                    },
                    url: data['Preview Image']
                }
            }
        };

        // Parse Gallery
        if (data['Gallery']) {
            const imageUrls = data['Gallery'].split(';').map(s => s.trim()).filter(s => s);
            // We'll add these as an 'image_gallery' slice
            const gallerySlice = {
                slice_type: "image_gallery",
                slice_label: null,
                variation: "default",
                primary: {},
                items: imageUrls.map(url => ({
                    image: {
                        origin: { url },
                        url
                    },
                    caption: ""
                }))
            };

            prismicDoc.data.slices = [gallerySlice];

            // Also add content block if "Top Section - Text #1" exists
            if (data['Top Section - Text #1'] || data['Top Section - Headline #1']) {
                const contentSlice = {
                    slice_type: "content_block",
                    slice_label: null,
                    variation: "default",
                    primary: {
                        content: []
                    },
                    items: []
                };

                if (data['Top Section - Headline #1']) {
                    contentSlice.primary.content.push({
                        type: "heading2",
                        text: data['Top Section - Headline #1'],
                        spans: []
                    });
                }
                if (data['Top Section - Text #1']) {
                    contentSlice.primary.content.push({
                        type: "paragraph",
                        text: data['Top Section - Text #1'],
                        spans: []
                    });
                }
                // Insert content before gallery
                prismicDoc.data.slices.unshift(contentSlice);
            }
        }

        works.push(prismicDoc);
    }
}

// Write to file
fs.writeFileSync(path.resolve(process.cwd(), 'prismic_import_works.json'), JSON.stringify(works, null, 2));

console.log(`Successfully converted ${works.length} items to prismic_import_works.json`);
