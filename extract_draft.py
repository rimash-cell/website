import os
import re

src_dir = r"C:\Users\rimaa\3D Objects\Website\Rima's - PB_SOURCE"
dest_dir = r"C:\Users\rimaa\3D Objects\Website\website_draft_1"
os.makedirs(dest_dir, exist_ok=True)

with open(os.path.join(src_dir, 'homepage_preview.html'), 'r', encoding='utf-8') as f:
    home_html = f.read()

with open(os.path.join(src_dir, 'work.html'), 'r', encoding='utf-8') as f:
    work_html = f.read()

home_styles = re.search(r'<style>(.*?)</style>', home_html, re.DOTALL).group(1).strip()
work_styles = re.search(r'<style>(.*?)</style>', work_html, re.DOTALL).group(1).strip()

# Find the specific parts of work_styles to append
# We look for "/* Dark nav variation for white background page */" to "/* CLOSE */" (excluding close which is shared)
# Actually, work.html has unique responsive fixes at the end as well.
# Let's just do a basic distinct block extractor or manual slicing since we know the file structure.

work_unique_1 = work_styles.split('/* Dark nav variation for white background page */')[1].split('/* CLOSE */')[0]
work_unique_1 = '/* Dark nav variation for white background page */' + work_unique_1

work_unique_2 = work_styles.split('/* Responsive Fixes */')[1]
work_unique_2 = '/* Responsive Fixes (Work Page) */' + work_unique_2

combined_css = home_styles + "\n\n/* ================================ */\n/* WORK PAGE SPECIFIC STYLES */\n/* ================================ */\n\n" + work_unique_1 + "\n\n" + work_unique_2

with open(os.path.join(dest_dir, 'styles.css'), 'w', encoding='utf-8') as f:
    f.write(combined_css)

js_content = """const nav = document.getElementById('main-nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Subcategory Mobile Toggle Fix (to ensure click events work without inline onclicks if we decide to remove them, but they are currently inline so no JS needed here except scroll)
"""

with open(os.path.join(dest_dir, 'scripts.js'), 'w', encoding='utf-8') as f:
    f.write(js_content)


# Build new home_html
new_home = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="styles.css">', home_html, flags=re.DOTALL)
new_home = re.sub(r'<script>.*?</script>', '<script src="scripts.js"></script>', new_home, flags=re.DOTALL)

# Update nav links in new_home
new_home = new_home.replace('<a href="#" class="logo">', '<a href="index.html" class="logo">')
new_home = new_home.replace('<a href="#key-projects">Work</a>', '<a href="work.html">Work</a>')
new_home = new_home.replace('<a href="#about">About</a>', '<a href="index.html#about">About</a>')
new_home = new_home.replace('<a href="#" class="btn-all-work">', '<a href="work.html" class="btn-all-work">')

# Update image relative paths since we're in another folder? No, we should create an assets folder or just copy the image
new_home = new_home.replace('src="homepage-hero.png"', 'src="../Rima\'s - PB_SOURCE/homepage-hero.png"')

with open(os.path.join(dest_dir, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(new_home)

# Build new work_html
new_work = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="styles.css">', work_html, flags=re.DOTALL)
new_work = re.sub(r'<script>.*?</script>', '<script src="scripts.js"></script>', new_work, flags=re.DOTALL)

new_work = new_work.replace('<a href="homepage_preview.html" class="logo">', '<a href="index.html" class="logo">')
new_work = new_work.replace('<a href="work.html" class="active">Work</a>', '<a href="work.html" class="active">Work</a>')
new_work = new_work.replace('<a href="homepage_preview.html#about">About</a>', '<a href="index.html#about">About</a>')
new_work = new_work.replace('<a href="homepage_preview.html">Work</a>', '<a href="work.html">Work</a>') # Footer links
new_work = new_work.replace('<a href="homepage_preview.html#about">About</a>', '<a href="index.html#about">About</a>')

with open(os.path.join(dest_dir, 'work.html'), 'w', encoding='utf-8') as f:
    f.write(new_work)

print("Extraction and merge complete.")
