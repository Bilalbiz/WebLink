// ========================================================================
// Advanced Product Page Script - JSON in same folder as index.html
// ========================================================================

// Filter sections based on category
function filterSelection(category) {
    const sections = document.querySelectorAll('.filter-section');
    const buttons = document.querySelectorAll('.nav-btn');

    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
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

// Glow effect on a product card
function applyGlow(el) {
    if (!el) return;
    el.classList.add('glow-active');
    setTimeout(() => {
        el.classList.remove('glow-active');
    }, 2500);
}

// Normalize IDs for product cards with "product-X"
function normalizeProductIds() {
    const cards = Array.from(document.querySelectorAll('.product-card'));
    const used = new Set();
    let maxNum = 0;

    cards.forEach(card => {
        const id = card.id || '';
        if (id.startsWith('product-') && id !== 'product-X') {
            used.add(id);
            const num = parseInt(id.replace('product-', ''), 10);
            if (!isNaN(num)) maxNum = Math.max(maxNum, num);
        }
    });

    let nextNum = Math.max(10, maxNum + 1);
    cards.forEach(card => {
        const id = card.id || '';
        if (!id || id === 'product-X') {
            while (used.has(`product-${nextNum}`)) nextNum++;
            const newId = `product-${nextNum}`;
            card.id = newId;
            used.add(newId);
            nextNum++;
        }
    });
}

// Render products dynamically from JSON
const renderProducts = (products) => {
    const template = document.getElementById('product-card-template');
    const galleries = document.querySelectorAll('.gallery');

    galleries.forEach(gallery => {
        const category = gallery.getAttribute('id'); // ID of section = category
        const categoryProducts = products.filter(p => p.category === category);

        gallery.innerHTML = ''; // Clear old cards

        if (categoryProducts.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'gallery-status';
            emptyMessage.textContent = 'No products yet.';
            gallery.appendChild(emptyMessage);
            return;
        }

        categoryProducts.forEach(product => {
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

// Handle deep linking via URL hash
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
        if (sectionEl) {
            filterSelection(sectionId);
            if (window.location.hash !== '#' + sectionId) {
                window.history.replaceState(null, '', '#' + sectionId);
            }
            setTimeout(() => {
                sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
            return;
        }
    }

    // Command-style: section-<id>,product-<id>
    if (cleanHash.includes(',')) {
        const parts = cleanHash.split(',');
        let sectionId = '';
        let productId = '';

        parts.forEach(part => {
            if (part.startsWith('section-')) sectionId = part.replace('section-', '');
            else if (part.startsWith('product-')) productId = part;
        });

        const sectionEl = sectionId ? document.getElementById(sectionId) : null;
        let targetEl = null;

        if (sectionEl && productId) targetEl = sectionEl.querySelector('#' + productId);
        if (!targetEl && productId) targetEl = document.getElementById(productId);

        if (targetEl) {
            const effectiveSectionId = sectionEl ? sectionId : (targetEl.closest('.filter-section')?.id || 'all');
            filterSelection(effectiveSectionId);

            const normalized = `#section-${effectiveSectionId},${targetEl.id}`;
            if (window.location.hash !== normalized) window.history.replaceState(null, '', normalized);

            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                applyGlow(targetEl);
            }, 100);
            return;
        }

        if (sectionId) filterSelection(sectionId);
        else filterSelection('all');
        return;
    }

    // Simple product or section
    const targetEl = document.getElementById(cleanHash);
    if (targetEl) {
        const secId = targetEl.closest('.filter-section')?.id || 'all';
        filterSelection(secId);
        setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            applyGlow(targetEl);
        }, 100);
        return;
    }

    const maybeSection = document.getElementById(cleanHash);
    if (maybeSection && maybeSection.classList.contains('filter-section')) filterSelection(cleanHash);
    else filterSelection('all');
};

// Fade-in animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ==================================================
// MAIN: Run on page load
// ==================================================
document.addEventListener("DOMContentLoaded", function() {
    normalizeProductIds();

    // Load products.json from same folder (root)
    fetch('products.json')
        .then(res => res.json())
        .then(data => {
            renderProducts(Array.isArray(data.products) ? data.products : []);
            handleHashNavigation();
        })
        .catch(err => {
            console.error('Failed to load products:', err);
            document.querySelectorAll('.gallery-status').forEach(s => s.textContent = 'Unable to load products right now.');
            handleHashNavigation();
        });
});

// Re-run hash navigation on hash change
window.addEventListener('hashchange', handleHashNavigation);
