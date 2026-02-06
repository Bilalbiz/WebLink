function filterSelection(category) {
    const sections = document.querySelectorAll('.filter-section');
    const buttons = document.querySelectorAll('.nav-btn');

    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
        // Check if the button's onclick attribute contains the category
        if (btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });

    // Show/Hide sections
    sections.forEach(section => {
        if (category === 'all' || section.id === category) {
            section.style.display = 'block';
            section.style.animation = 'fadeIn 0.5s';
        } else {
            section.style.display = 'none';
        }
    });
}

function applyGlow(el) {
    if (!el) return;
    el.classList.add('glow-active');
    setTimeout(() => {
        el.classList.remove('glow-active');
    }, 2500);
}

// Convert placeholder IDs like "product-X" to unique IDs so deep links work reliably
function normalizeProductIds() {
    const cards = Array.from(document.querySelectorAll('.product-card'));
    const used = new Set();
    let maxNum = 0;

    cards.forEach((card) => {
        const id = card.id || '';
        if (id.startsWith('product-') && id !== 'product-X') {
            used.add(id);
            const num = parseInt(id.replace('product-', ''), 10);
            if (!isNaN(num)) {
                maxNum = Math.max(maxNum, num);
            }
        }
    });

    let nextNum = Math.max(10, maxNum + 1);

    cards.forEach((card) => {
        const id = card.id || '';
        if (!id || id === 'product-X') {
            while (used.has(`product-${nextNum}`)) {
                nextNum++;
            }
            const newId = `product-${nextNum}`;
            card.id = newId;
            used.add(newId);
            nextNum++;
        }
    });
}

const renderProducts = (products) => {
    const template = document.getElementById('product-card-template');
    const galleries = document.querySelectorAll('.gallery[data-category]');

    galleries.forEach((gallery) => {
        const category = gallery.dataset.category;
        const categoryProducts = products.filter((product) => product.category === category);

        gallery.innerHTML = '';

        if (categoryProducts.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'gallery-status';
            emptyMessage.textContent = 'No products yet.';
            gallery.appendChild(emptyMessage);
            return;
        }

        categoryProducts.forEach((product) => {
            const card = template.content.firstElementChild.cloneNode(true);
            card.id = product.id;
            const img = card.querySelector('img');
            img.src = product.image;
            img.alt = product.title;
            card.querySelector('h2').textContent = product.title;
            card.querySelector('p').textContent = product.description;
            const link = card.querySelector('a');
            link.href = product.url;
            gallery.appendChild(card);
        });
    });
};

const handleHashNavigation = () => {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length <= 1) {
        filterSelection('all');
        return;
    }

    const cleanHash = rawHash.substring(1);

    // Single-section format: #section-<id>
    if (cleanHash.indexOf(',') === -1 && cleanHash.indexOf('section-') === 0) {
        const sectionId = cleanHash.replace('section-', '');
        const sectionEl = document.getElementById(sectionId);
        if (sectionEl && sectionEl.classList && sectionEl.classList.contains('filter-section')) {
            filterSelection(sectionId);
            setTimeout(() => {
                sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
            return;
        }
    }

    // Command-style: section-<id>,product-<id>
    if (cleanHash.indexOf(',') !== -1) {
        const parts = cleanHash.split(',');
        let sectionId = '';
        let productId = '';

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.indexOf('section-') === 0) {
                sectionId = part.replace('section-', '');
            } else if (part.indexOf('product-') === 0) {
                productId = part;
            }
        }

        const targetEl = productId ? document.getElementById(productId) : null;
        if (targetEl) {
            const parentSection = targetEl.closest('.filter-section');
            const effectiveSectionId = parentSection ? parentSection.id : (sectionId || 'all');
            filterSelection(effectiveSectionId);

            // Force :target behavior to be accurate to product id
            if (window.location.hash !== '#' + productId) {
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, '', '#' + productId);
                } else {
                    window.location.hash = '#' + productId;
                }
            }

            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                applyGlow(targetEl);
            }, 100);
            return;
        }

        // If product not found, at least switch section if provided
        if (sectionId) {
            filterSelection(sectionId);
        } else {
            filterSelection('all');
        }
        return;
    }

    // Simple product or section id
    const targetEl = document.getElementById(cleanHash);
    if (targetEl) {
        const parentSection = targetEl.closest('.filter-section');
        const secId = parentSection ? parentSection.id : 'all';
        filterSelection(secId);
        setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            applyGlow(targetEl);
        }, 100);
        return;
    }

    const maybeSection = document.getElementById(cleanHash);
    if (maybeSection && maybeSection.classList && maybeSection.classList.contains('filter-section')) {
        filterSelection(cleanHash);
    } else {
        filterSelection('all');
    }
};

// Add fade in animation to style
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// AUTOMATICALLY DETECT SECTION FROM URL LINK
// Supports formats:
// 1. #product-1  (Auto-detects section)
// 2. #section-nails,product-1 (Explicit section and product)
document.addEventListener("DOMContentLoaded", function() {
    normalizeProductIds();
    fetch('data/products.json')
        .then((response) => response.json())
        .then((data) => {
            renderProducts(Array.isArray(data.products) ? data.products : []);
            handleHashNavigation();
        })
        .catch((error) => {
            console.error('Failed to load products:', error);
            document.querySelectorAll('.gallery-status').forEach((status) => {
                status.textContent = 'Unable to load products right now.';
            });
            handleHashNavigation();
        });
});

// Re-run navigation logic whenever hash changes (e.g., user clicks a link)
window.addEventListener('hashchange', handleHashNavigation);
