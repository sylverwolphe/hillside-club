// ===== PAGE NAVIGATION SYSTEM (Scroll-Snap Based) =====
// Handles page scrolling, URL hash updates, and nav highlighting

(function initPageNavigation() {
    let currentPage = 'landing';
    let scrollTimeout;

    // Get page from URL hash on load
    function getPageFromHash() {
        const hash = window.location.hash.replace('#', '');
        return hash || 'landing';
    }

    // Update active states on nav links
    function updateNavActiveStates(pageName) {
        // Desktop nav
        document.querySelectorAll('.nav-link').forEach(link => {
            const isActive = link.dataset.page === pageName;
            link.classList.toggle('active', isActive);

            // Reset drink theme styling when switching pages
            if (isActive) {
                // Re-apply drink theme to active link if one is set
                if (window.currentDrinkTheme && window.currentDrinkTheme !== 'default') {
                    const color = window.getLogoColor ? window.getLogoColor(window.currentDrinkTheme) : '';
                    link.style.color = color || '';
                    link.style.borderColor = color || '';
                }
            } else {
                link.style.color = '';
                link.style.borderColor = '';
            }
        });

        // Mobile nav
        document.querySelectorAll('.mobile-nav-item').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });
    }

    // Navigate to a page by scrolling
    window.navigateTo = function(pageName) {
        const pageEl = document.getElementById(`page-${pageName}`);
        if (!pageEl) return;

        const isMobile = window.innerWidth <= 768;
        let scrollTop;

        if (isMobile) {
            // On mobile: account for bottom navbar (80px)
            // Scroll so content is better centered in visible area
            const mobileNavbarHeight = 80;
            const viewportHeight = window.innerHeight;
            const visibleHeight = viewportHeight - mobileNavbarHeight;

            // Get the page's content height (approximate)
            const pageHeight = pageEl.offsetHeight;

            // If page content fits in visible area, center it
            // Otherwise, scroll to top of page with small offset for breathing room
            if (pageHeight < visibleHeight) {
                // Center the page in visible area
                const offset = (visibleHeight - pageHeight) / 2;
                scrollTop = pageEl.offsetTop - offset;
            } else {
                // Page is taller than visible area - scroll to top with small breathing room
                scrollTop = pageEl.offsetTop - 10;
            }
        } else {
            // Desktop: account for top nav
            const navHeight = 70;
            scrollTop = pageEl.offsetTop - navHeight;
        }

        // Scroll to page
        window.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
        });

        // Update URL hash without triggering scroll
        if (window.location.hash !== `#${pageName}`) {
            history.pushState(null, '', `#${pageName}`);
        }
    };

    // Detect which page is currently in view using IntersectionObserver
    const pages = document.querySelectorAll('.page');

    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Trigger when page is roughly centered
        threshold: 0
    };

    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageName = entry.target.dataset.page;
                if (pageName && pageName !== currentPage) {
                    currentPage = pageName;

                    // Update nav highlighting
                    updateNavActiveStates(pageName);

                    // Update page theme colors
                    if (window.applyPageTheme) {
                        window.applyPageTheme(pageName);
                    }

                    // Update URL hash (debounced to prevent rapid updates)
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        if (window.location.hash !== `#${pageName}`) {
                            history.replaceState(null, '', `#${pageName}`);
                        }
                    }, 100);
                }
            }
        });
    }, observerOptions);

    // Observe all pages
    pages.forEach(page => pageObserver.observe(page));

    // Handle nav link clicks
    document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = link.dataset.page;
            if (pageName) {
                navigateTo(pageName);
            }
        });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const pageName = getPageFromHash();
        navigateTo(pageName);
    });

    // Initialize on load - scroll to page from hash
    const initialPage = getPageFromHash();
    currentPage = initialPage;
    updateNavActiveStates(initialPage);

    // If there's a hash, scroll to that page after a brief delay
    if (initialPage !== 'landing') {
        setTimeout(() => {
            navigateTo(initialPage);
        }, 100);
    }

})();
