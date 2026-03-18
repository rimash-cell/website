const nav = document.getElementById('main-nav');
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Subcategory Mobile Toggle Fix
document.addEventListener('DOMContentLoaded', () => {
    const filterItems = document.querySelectorAll('.sector-tag-item, .filter-item');

    filterItems.forEach(item => {
        // Toggle on click (for mobile accordion and tab focus)
        item.addEventListener('click', (e) => {
            // Prevent link jumping if it's an interior link (though we handled that with void(0) too)
            if (e.target.tagName.toLowerCase() === 'a' && e.target.getAttribute('href') !== '#') {
                return;
            }

            if (window.innerWidth <= 900) {
                // Close others if desired, otherwise simply toggle
                const isActive = item.classList.contains('active');

                // Optional: close other open items to maintain flow cleanly
                filterItems.forEach(i => i.classList.remove('active'));

                if (!isActive) {
                    item.classList.add('active');
                }
            }
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sector-tag-item') && !e.target.closest('.filter-item')) {
            filterItems.forEach(i => i.classList.remove('active'));
        }
    });
});
