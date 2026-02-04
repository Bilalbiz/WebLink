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
// This runs when the page finishes loading
document.addEventListener("DOMContentLoaded", function() {
    // 1. Check if there is a hash in the URL (e.g., #product-7)
    const hash = window.location.hash;

    if (hash) {
        // Remove the '#' character to get the ID
        const targetId = hash.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // 2. Find which section this product belongs to
            const section = targetElement.closest('.filter-section');
            
            if (section) {
                // 3. Switch the filter to that section
                filterSelection(section.id);
                
                // 4. Scroll to the product (give a small delay to ensure it's visible)
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    } else {
        // Default to 'all' if no specific product link
        filterSelection('all');
    }
});
