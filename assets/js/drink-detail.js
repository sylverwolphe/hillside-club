// ===== IMAGE LIGHTBOX =====
// Full-size image viewer for drink images

(function initImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const closeBtn = lightbox?.querySelector('.lightbox-close');

    if (!lightbox || !lightboxImg) return;

    // Open lightbox with image
    window.openImageLightbox = function(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close button
    closeBtn?.addEventListener('click', closeLightbox);

    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
})();

// ===== DRINK DETAIL VIEW =====
// Handles expanded drink view and menu slider

(function initDrinkDetailView() {
    const detailView = document.getElementById('drinkDetailView');
    const scrollWrapper = document.getElementById('menuScrollWrapper');
    const backButton = document.getElementById('drinkDetailBack');
    const prevButton = document.getElementById('drinkDetailPrev');
    const nextButton = document.getElementById('drinkDetailNext');
    const detailIllustration = document.getElementById('drinkDetailIllustration');
    const detailName = document.getElementById('drinkDetailName');
    const detailDesc = document.getElementById('drinkDetailDesc');
    const detailExtras = document.getElementById('drinkDetailExtras');

    if (!detailView || !scrollWrapper || !backButton) return;

    // Track current drink index for navigation
    let currentDrinkIndex = 0;
    let drinkCards = [];

    // Update navigation button states
    function updateNavButtons() {
        if (prevButton) {
            prevButton.disabled = currentDrinkIndex <= 0;
        }
        if (nextButton) {
            nextButton.disabled = currentDrinkIndex >= drinkCards.length - 1;
        }
    }

    // Show detail view for a drink
    window.showDrinkDetail = function(drinkId, cardElement) {
        const details = drinkDetails[drinkId];
        if (!details) return;

        // Get all drink cards and find current index
        drinkCards = Array.from(document.querySelectorAll('.drink-card'));
        currentDrinkIndex = drinkCards.indexOf(cardElement);

        // Copy the illustration from the card (image or SVG)
        const img = cardElement.querySelector('.drink-image');
        const svg = cardElement.querySelector('.drink-svg');
        if (img) {
            detailIllustration.innerHTML = img.outerHTML;
            // Add click handler for lightbox
            const detailImg = detailIllustration.querySelector('.drink-image');
            if (detailImg) {
                detailImg.addEventListener('click', () => {
                    if (window.openImageLightbox) {
                        openImageLightbox(detailImg.src, detailImg.alt);
                    }
                });
            }
        } else if (svg) {
            detailIllustration.innerHTML = svg.outerHTML;
        }

        // Set the content
        detailName.textContent = details.name;
        detailDesc.textContent = details.desc;
        detailExtras.innerHTML = details.extras;

        // Hide scroll wrapper, show detail view
        scrollWrapper.classList.add('hidden');
        detailView.classList.add('active');

        // Update nav button states
        updateNavButtons();

        // Trigger animation after display change
        requestAnimationFrame(() => {
            detailView.style.opacity = '1';
            detailView.style.transform = 'translateY(0)';
        });
    };

    // Navigate to a drink by index
    function navigateToDrink(index) {
        if (index < 0 || index >= drinkCards.length) return;

        const card = drinkCards[index];
        const drinkId = card.dataset.drink;

        // Update selected state
        drinkCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Update colors and effects
        if (window.setLiquidDrink) setLiquidDrink(drinkId);
        if (window.setSpiceColors) setSpiceColors(drinkId);
        if (window.setDrinkTheme) setDrinkTheme(drinkId);

        // Show the new drink detail
        currentDrinkIndex = index;
        const details = drinkDetails[drinkId];
        if (!details) return;

        // Copy the illustration from the card (image or SVG)
        const img = card.querySelector('.drink-image');
        const svg = card.querySelector('.drink-svg');
        if (img) {
            detailIllustration.innerHTML = img.outerHTML;
            // Add click handler for lightbox
            const detailImg = detailIllustration.querySelector('.drink-image');
            if (detailImg) {
                detailImg.addEventListener('click', () => {
                    if (window.openImageLightbox) {
                        openImageLightbox(detailImg.src, detailImg.alt);
                    }
                });
            }
        } else if (svg) {
            detailIllustration.innerHTML = svg.outerHTML;
        }

        // Set the content
        detailName.textContent = details.name;
        detailDesc.textContent = details.desc;
        detailExtras.innerHTML = details.extras;

        // Update nav button states
        updateNavButtons();
    }

    // Hide detail view and show scroll menu
    window.hideDrinkDetail = function() {
        detailView.classList.remove('active');
        scrollWrapper.classList.remove('hidden');

        // Reset liquid shader and colors
        if (window.setLiquidDrink) setLiquidDrink('none');
        if (window.setSpiceColors) setSpiceColors('default');
        if (window.setLogoColor) setLogoColor('default');

        // Remove selected state from cards
        document.querySelectorAll('.drink-card').forEach(c => c.classList.remove('selected'));
    };

    // Back button handler
    backButton.addEventListener('click', (e) => {
        e.stopPropagation();
        hideDrinkDetail();
    });

    // Previous button handler
    if (prevButton) {
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateToDrink(currentDrinkIndex - 1);
        });
    }

    // Next button handler
    if (nextButton) {
        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateToDrink(currentDrinkIndex + 1);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!detailView.classList.contains('active')) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateToDrink(currentDrinkIndex - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateToDrink(currentDrinkIndex + 1);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            hideDrinkDetail();
        }
    });
})();

// ===== MENU SLIDER CONTROL =====
(function initMenuSlider() {
    const slider = document.getElementById('menuSlider');
    const scrollContainer = document.querySelector('.drinks-scroll');
    if (!slider || !scrollContainer) return;

    let isSliderActive = false;

    // Update slider when scrolling manually
    scrollContainer.addEventListener('scroll', () => {
        if (isSliderActive) return;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if (maxScroll > 0) {
            slider.value = (scrollContainer.scrollLeft / maxScroll) * 100;
        }
    });

    // Disable scroll-snap while dragging slider
    slider.addEventListener('mousedown', () => {
        isSliderActive = true;
        scrollContainer.style.scrollSnapType = 'none';
        scrollContainer.style.scrollBehavior = 'auto';
    });

    slider.addEventListener('touchstart', () => {
        isSliderActive = true;
        scrollContainer.style.scrollSnapType = 'none';
        scrollContainer.style.scrollBehavior = 'auto';
    }, { passive: true });

    // Re-enable scroll-snap when done
    const endSliderDrag = () => {
        if (!isSliderActive) return;
        isSliderActive = false;
        setTimeout(() => {
            scrollContainer.style.scrollSnapType = 'x mandatory';
            scrollContainer.style.scrollBehavior = 'smooth';
        }, 150);
    };

    window.addEventListener('mouseup', endSliderDrag);
    window.addEventListener('touchend', endSliderDrag);

    // Scroll when slider changes
    slider.addEventListener('input', () => {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollContainer.scrollLeft = (slider.value / 100) * maxScroll;
    });
})();
