// ===== MODALS, FORMS, AND UI COMPONENTS =====

// ===== ACCESSIBLE FORM NOTIFICATIONS (ARIA-LIVE) =====
let notificationTimeout = null;

function showNotification(message, type = 'success') {
    const notification = document.getElementById('formNotification');
    if (!notification) return;

    // Clear any existing timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    // Remove existing classes and set new content
    notification.classList.remove('visible', 'success', 'error');
    notification.textContent = message;
    notification.classList.add(type);

    // Trigger reflow to restart animation
    void notification.offsetWidth;

    // Show notification
    notification.classList.add('visible');

    // Auto-hide after 5 seconds
    notificationTimeout = setTimeout(() => {
        notification.classList.remove('visible');
    }, 5000);
}

// ===== UNIFIED PARTNERSHIP FORM =====
const partnershipCategorySelect = document.getElementById('partner-category');
const partnershipSubmitBtn = document.getElementById('partnershipSubmit');
const partnershipInfoCard = document.getElementById('partnershipInfoCard');
const partnershipInfoContainer = document.querySelector('.partnership-info-container');
const infoCardToggle = document.getElementById('infoCardToggle');

const categorySubmitText = {
    'investor': 'Request Investment Info',
    'business': 'Send Partnership Inquiry',
    'barista': 'Submit Application'
};

// Toggle info card visibility
const bottomSheetBackdrop = document.getElementById('bottomSheetBackdrop');

function isMobileView() {
    return window.innerWidth <= 1100;
}

function toggleInfoCard(show) {
    if (!partnershipInfoContainer || !infoCardToggle) return;

    const shouldShow = show === undefined
        ? !partnershipInfoContainer.classList.contains('visible')
        : show;

    if (shouldShow) {
        partnershipInfoContainer.classList.add('visible');
        infoCardToggle.classList.add('active');
        // Lock body scroll on mobile
        if (isMobileView()) {
            document.body.style.overflow = 'hidden';
            if (bottomSheetBackdrop) bottomSheetBackdrop.classList.add('visible');
        }
    } else {
        partnershipInfoContainer.classList.remove('visible');
        infoCardToggle.classList.remove('active');
        // Restore body scroll
        if (isMobileView()) {
            document.body.style.overflow = '';
            if (bottomSheetBackdrop) bottomSheetBackdrop.classList.remove('visible');
        }
    }
}

// Close bottom sheet when clicking backdrop
if (bottomSheetBackdrop) {
    bottomSheetBackdrop.addEventListener('click', () => toggleInfoCard(false));
}

// Close bottom sheet on Escape key (mobile only)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileView() && partnershipInfoContainer?.classList.contains('visible')) {
        toggleInfoCard(false);
    }
});

// Handle window resize - clean up mobile styles when switching to desktop
window.addEventListener('resize', () => {
    if (!isMobileView() && partnershipInfoContainer?.classList.contains('visible')) {
        document.body.style.overflow = '';
        if (bottomSheetBackdrop) bottomSheetBackdrop.classList.remove('visible');
    }
});

// Info card toggle button
if (infoCardToggle) {
    infoCardToggle.addEventListener('click', () => toggleInfoCard());
}

// Category button clicks
const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const selectedCategory = this.dataset.category;

        // Update button states and aria-pressed
        categoryButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');

        // Update hidden input value
        if (partnershipCategorySelect) {
            partnershipCategorySelect.value = selectedCategory;
        }

        // Update category-specific form fields and required attributes
        document.querySelectorAll('.category-fields').forEach(field => {
            field.classList.remove('active');
            // Remove required from all inputs in hidden category fields
            field.querySelectorAll('input, textarea').forEach(input => {
                input.removeAttribute('required');
            });
        });
        if (selectedCategory) {
            const activeFields = document.querySelector(`.category-fields[data-category="${selectedCategory}"]`);
            if (activeFields) {
                activeFields.classList.add('active');
                // Add required to primary inputs in the active category
                // (first input in each category is typically the most important)
                const primaryInput = activeFields.querySelector('input:first-of-type');
                if (primaryInput) {
                    primaryInput.setAttribute('required', '');
                }
            }
        }

        // Update info card content
        if (partnershipInfoCard) {
            partnershipInfoCard.querySelectorAll('.info-card-content').forEach(content => {
                content.style.display = 'none';
            });
            const targetContent = partnershipInfoCard.querySelector(
                `.info-card-content[data-category="${selectedCategory || 'default'}"]`
            );
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        }

        // Auto-show info card when category selected
        toggleInfoCard(true);

        // Update submit button
        if (partnershipSubmitBtn) {
            if (selectedCategory && categorySubmitText[selectedCategory]) {
                partnershipSubmitBtn.disabled = false;
                partnershipSubmitBtn.textContent = categorySubmitText[selectedCategory];
            } else {
                partnershipSubmitBtn.disabled = true;
                partnershipSubmitBtn.textContent = 'Select a category above';
            }
        }
    });
});

// Partnership form submission
const partnershipForm = document.getElementById('partnershipForm');
if (partnershipForm) {
    partnershipForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        const category = data.category;

        if (!category) {
            showNotification('Please select a category first.', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Map to appropriate Google Form based on category
            const formIdMap = {
                'investor': 'investorForm',
                'business': 'businessForm',
                'barista': 'baristaForm'
            };

            const targetFormId = formIdMap[category];
            if (targetFormId && typeof submitToGoogleForm === 'function') {
                await submitToGoogleForm(targetFormId, data);
            }

            const successMessages = {
                'investor': 'investor inquiry',
                'business': 'partnership inquiry',
                'barista': 'application'
            };

            showNotification(
                `Thanks ${data.name}! We've received your ${successMessages[category]}. We'll get back to you within a few days.`,
                'success'
            );
            this.reset();

            // Reset form state
            document.querySelectorAll('.category-fields').forEach(f => {
                f.classList.remove('active');
                // Remove required from category-specific inputs
                f.querySelectorAll('input, textarea').forEach(input => {
                    input.removeAttribute('required');
                });
            });
            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            if (partnershipInfoCard) {
                partnershipInfoCard.querySelectorAll('.info-card-content').forEach(c => c.style.display = 'none');
                const defaultContent = partnershipInfoCard.querySelector('.info-card-content[data-category="default"]');
                if (defaultContent) defaultContent.style.display = 'block';
            }
            toggleInfoCard(false);
            submitBtn.disabled = true;
            submitBtn.textContent = 'Select a category above';

        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('There was an error submitting the form. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// ===== FOCUS TRAPPING FOR ACCESSIBILITY =====
let lastFocusedElement = null;
let currentTrapModal = null;

// Get all focusable elements within a container
function getFocusableElements(container) {
    const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    return Array.from(container.querySelectorAll(focusableSelectors));
}

// Trap focus within a modal (only on Tab key)
function trapFocus(e) {
    if (e.key !== 'Tab' || !currentTrapModal) return;

    const focusable = getFocusableElements(currentTrapModal);
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
    }
}

// Handle Escape key to close modals
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        // Check for active modals and close them
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            const modalId = activeModal.id;
            if (modalId === 'projectModal') {
                closeProjectModal();
            } else {
                closeModal(modalId);
            }
        }
    }
}

// Set up focus trap for a modal
function enableFocusTrap(modal) {
    lastFocusedElement = document.activeElement;
    currentTrapModal = modal;

    // Focus the close button or first focusable element
    const closeBtn = modal.querySelector('.modal-close');
    const focusable = getFocusableElements(modal);

    setTimeout(() => {
        if (closeBtn) {
            closeBtn.focus();
        } else if (focusable.length > 0) {
            focusable[0].focus();
        }
    }, 50);

    document.addEventListener('keydown', trapFocus);
}

// Remove focus trap and restore focus
function disableFocusTrap() {
    document.removeEventListener('keydown', trapFocus);
    currentTrapModal = null;

    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// Global Escape key listener
document.addEventListener('keydown', handleEscapeKey);

// Team Section Toggle
function toggleTeam() {
    const content = document.getElementById('teamContent');
    const arrow = document.getElementById('teamToggle');
    content.classList.toggle('expanded');
    arrow.classList.toggle('expanded');
}

// Mobile Navbar - Scroll to Section
function scrollToSection(sectionId) {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
        const navbarHeight = 80;
        const sectionTop = section.offsetTop - 20;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });

        if (sectionId === 'team') {
            const teamContent = document.getElementById('teamContent');
            if (!teamContent.classList.contains('expanded')) {
                toggleTeam();
            }
        }
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    enableFocusTrap(modal);
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    disableFocusTrap();
}

// Close modals when clicking outside
['unlimitedModal'].forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(modalId);
            }
        });
    }
});

// Google Forms submission configuration
// Note: investorForm, businessForm, baristaForm are submitted via the unified partnershipForm
// unlimitedForm is a standalone modal form
const googleFormsConfig = {
    'investorForm': {
        formId: 'YOUR_INVESTOR_FORM_ID',
        fields: {
            'name': 'entry.XXXXXXXXX',
            'email': 'entry.XXXXXXXXX',
            'phone': 'entry.XXXXXXXXX',
            'linkedin': 'entry.XXXXXXXXX',
            'details': 'entry.XXXXXXXXX'
        }
    },
    'businessForm': {
        formId: 'YOUR_BUSINESS_FORM_ID',
        fields: {
            'name': 'entry.XXXXXXXXX',
            'email': 'entry.XXXXXXXXX',
            'business': 'entry.XXXXXXXXX',
            'website': 'entry.XXXXXXXXX',
            'details': 'entry.XXXXXXXXX'
        }
    },
    'baristaForm': {
        formId: 'YOUR_BARISTA_FORM_ID',
        fields: {
            'name': 'entry.XXXXXXXXX',
            'email': 'entry.XXXXXXXXX',
            'experience': 'entry.XXXXXXXXX',
            'availability': 'entry.XXXXXXXXX',
            'details': 'entry.XXXXXXXXX'
        }
    },
    'unlimitedForm': {
        formId: 'YOUR_UNLIMITED_FORM_ID',
        fields: {
            'name': 'entry.XXXXXXXXX',
            'email': 'entry.XXXXXXXXX',
            'phone': 'entry.XXXXXXXXX',
            'source': 'entry.XXXXXXXXX'
        },
        successMessage: 'unlimited membership signup'
    }
};

// Submit form data to Google Forms via hidden iframe
function submitToGoogleForm(formId, formData) {
    const config = googleFormsConfig[formId];
    if (!config || config.formId.includes('YOUR_')) {
        console.log('Google Form not configured for:', formId, formData);
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = 'hidden_iframe_' + Date.now();
        document.body.appendChild(iframe);

        const submitForm = document.createElement('form');
        submitForm.target = iframe.name;
        submitForm.method = 'POST';
        submitForm.action = `https://docs.google.com/forms/d/e/${config.formId}/formResponse`;

        Object.keys(config.fields).forEach(fieldName => {
            if (formData[fieldName] !== undefined) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = config.fields[fieldName];
                input.value = formData[fieldName] || '';
                submitForm.appendChild(input);
            }
        });

        document.body.appendChild(submitForm);
        submitForm.submit();

        setTimeout(() => {
            document.body.removeChild(iframe);
            document.body.removeChild(submitForm);
            resolve();
        }, 1000);
    });
}

// Unlimited membership form submission handler (standalone modal form)
const unlimitedForm = document.getElementById('unlimitedForm');
if (unlimitedForm) {
    unlimitedForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        const config = googleFormsConfig['unlimitedForm'];

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            await submitToGoogleForm('unlimitedForm', data);
            closeModal('unlimitedModal');
            this.reset();
            showNotification(`Thanks ${data.name}! We've received your ${config.successMessage}. We'll get back to you within a few days.`, 'success');
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('There was an error submitting the form. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Dollar Ticker Class
class DollarTicker {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.currentValue = 0;
        this.targetValue = options.targetValue || 10000;
        this.duration = options.duration || 3000;
        this.hasStarted = false;

        this.render();
        this.setupIntersectionObserver();
    }

    formatNumber(num) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    render() {
        const formatted = this.formatNumber(this.currentValue);
        const chars = formatted.split('');

        this.container.innerHTML = '';
        chars.forEach((char) => {
            const digitDiv = document.createElement('div');
            if (char === ',' || char === '.') {
                digitDiv.className = 'ticker-digit separator';
                digitDiv.textContent = char;
            } else {
                digitDiv.className = 'ticker-digit';
                const wrapper = document.createElement('div');
                wrapper.className = 'digit-wrapper';
                wrapper.textContent = char;
                digitDiv.appendChild(wrapper);
            }
            this.container.appendChild(digitDiv);
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasStarted) {
                    this.hasStarted = true;
                    this.animate();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.container);
    }

    animate() {
        const startTime = Date.now();
        const startValue = this.currentValue;

        const step = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const easeOutQuad = progress * (2 - progress);

            this.currentValue = startValue + (this.targetValue - startValue) * easeOutQuad;
            this.render();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                this.currentValue = this.targetValue;
                this.render();
            }
        };

        requestAnimationFrame(step);
    }
}

// Initialize ticker
const ticker = new DollarTicker('ticker', {
    targetValue: 455,
    duration: 3000
});

// Project Modal Functions
function openProjectModal(projectData) {
    const modal = document.getElementById('projectModal');
    document.getElementById('projectTitle').textContent = projectData.title;
    document.getElementById('projectContent').innerHTML = projectData.content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    enableFocusTrap(modal);

    if (projectData.title === 'Parallel') {
        modalCurrentSlide = 0;
        setTimeout(startModalSlideshow, 100);
    }
}

function closeProjectModal() {
    clearInterval(modalSlideInterval);
    document.getElementById('projectModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    disableFocusTrap();
}

// Close project modal when clicking outside
const projectModalEl = document.getElementById('projectModal');
if (projectModalEl) {
    projectModalEl.addEventListener('click', function(e) {
        if (e.target === this) closeProjectModal();
    });
}

// Project data
const projects = {
    bayword: {
        title: 'Bay Word',
        content: `
            <div class="project-icon" style="color: #ff4444;">~!</div>
            <p style="color: var(--charcoal-ink); line-height: 1.8; margin-bottom: 15px;">
                bay word is for the soft voices that haven't congealed quite enough for established publications. currently online+paper - maybe letterpress someday? write something+say hi
            </p>
            <a href="https://bay-word.vercel.app" target="_blank"
               style="display: inline-block; padding: 12px 24px; background: var(--dusty-rose);
                      color: var(--cream-parchment); text-decoration: none; margin-top: 10px;">
                Visit Bay Word →
            </a>
        `
    },
    parallel: {
        title: 'Parallel',
        content: `
            <div class="modal-slideshow">
                <img src="https://i.imgur.com/qbQNpPI.jpeg" class="modal-slide active">
                <img src="https://i.imgur.com/bPDVrAB.jpeg" class="modal-slide">
                <img src="https://i.imgur.com/4hmZSXS.jpeg" class="modal-slide">
                <img src="https://i.imgur.com/eaj9SPD.png" class="modal-slide">
                <img src="https://i.imgur.com/KCsdU31.jpeg" class="modal-slide rotated">
                <div class="slideshow-dots">
                    <span class="dot active" onclick="goToSlide(0)"></span>
                    <span class="dot" onclick="goToSlide(1)"></span>
                    <span class="dot" onclick="goToSlide(2)"></span>
                    <span class="dot" onclick="goToSlide(3)"></span>
                    <span class="dot" onclick="goToSlide(4)"></span>
                </div>
            </div>
            <p style="color: var(--charcoal-ink); line-height: 1.8; margin-top: 20px;">
                Ren is working on a retro futuristic, urban exploration, myst-like, speculative fiction game. The next development update will be posted on Dec 1st; expect dynamic, behind-the-scenes visuals and atmospheric music.
            </p>
            <a href="https://substack.com/@gratifiedwegrow" target="_blank">
                <p style="color: var(--olive-bronze); font-style: italic;">Follow Gratified's Substack for game updates</p>
            </a>
        `
    },
    accumulate: {
        title: 'Accumulate Dollars',
        content: `
            <p style="color: var(--charcoal-ink); line-height: 1.8; margin-bottom: 15px;">
                Nat is currently working for a couple clients in east bay and san francisco, and seeking more! When not serving matchas at coworking spaces, she has big dreams about the ceiling for PA excellence, and would love to chat about your needs and goals.
            </p>
            <p style="color: var(--olive-bronze); font-style: italic;">
                Text/Signal Leah at 4703546184 for an introduction
            </p>
        `
    }
};

// Modal slideshow functionality
let modalCurrentSlide = 0;
let modalSlideInterval = null;

function startModalSlideshow() {
    const slides = document.querySelectorAll('.modal-slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');

    if (slides.length === 0) return;

    modalSlideInterval = setInterval(() => {
        slides[modalCurrentSlide].classList.remove('active');
        dots[modalCurrentSlide].classList.remove('active');

        modalCurrentSlide = (modalCurrentSlide + 1) % slides.length;

        slides[modalCurrentSlide].classList.add('active');
        dots[modalCurrentSlide].classList.add('active');
    }, 3000);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.modal-slide');
    const dots = document.querySelectorAll('.slideshow-dots .dot');

    slides[modalCurrentSlide].classList.remove('active');
    dots[modalCurrentSlide].classList.remove('active');

    modalCurrentSlide = index;

    slides[modalCurrentSlide].classList.add('active');
    dots[modalCurrentSlide].classList.add('active');

    clearInterval(modalSlideInterval);
    startModalSlideshow();
}
