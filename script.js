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
    const hash = window.location.hash;

    if (hash) {
        // Remove the '#' character
        const cleanHash = hash.substring(1);
        
        // CHECK FOR COMMA SEPARATED FORMAT: section-nails,product-1
        if (cleanHash.includes(',')) {
            const parts = cleanHash.split(',');
            let sectionId = '';
            let productId = '';

            // Parse parts
            parts.forEach(part => {
                if (part.startsWith('section-')) {
                    sectionId = part.replace('section-', '');
                } else if (part.startsWith('product-')) {
                    productId = part;
                }
            });

            if (sectionId && productId) {
                // 1. Switch to the specified section
                filterSelection(sectionId);

                // 2. Find and Highlight the product
                const targetElement = document.getElementById(productId);
                if (targetElement) {
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Trigger custom glow animation class
                        targetElement.classList.add('glow-active');
                        // Remove class after animation finishes so it can be re-triggered if needed
                        setTimeout(() => {
                            targetElement.classList.remove('glow-active');
                        }, 2500); 
                    }, 100);
                }
            }
        } 
        // CHECK FOR SIMPLE ID FORMAT: #product-1
        else {
            const targetElement = document.getElementById(cleanHash);
            if (targetElement) {
                // Find parent section and switch to it
                const section = targetElement.closest('.filter-section');
                if (section) {
                    filterSelection(section.id);
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // :target pseudo-class handles the glow automatically here
                    }, 100);
                }
            } else {
                // If ID matches a section (e.g., #nails), switch to it
                if (document.getElementById(cleanHash)?.classList.contains('filter-section')) {
                    filterSelection(cleanHash);
                } else {
                    filterSelection('all');
                }
            }
        }
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
