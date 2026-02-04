// ===== SUBSCRIBE PAGE LOADER =====
// Loads subscribe page content from config/subscribe-config.json

(function loadSubscribeContent() {
    fetch('config/subscribe-config.json')
        .then(response => response.json())
        .then(config => {
            renderSubscribePage(config);
        })
        .catch(error => {
            console.error('Error loading subscribe config:', error);
        });

    function renderSubscribePage(config) {
        // Page header
        const pageTitle = document.querySelector('#page-subscribe .logo');
        const pageTagline = document.querySelector('#page-subscribe .tagline');

        if (pageTitle) pageTitle.textContent = config.page.title;
        if (pageTagline) pageTagline.textContent = config.page.tagline;

        // Join section
        const joinTitle = document.querySelector('#page-subscribe .section-title');
        const joinIntro = document.querySelector('#page-subscribe .section-intro');

        if (joinTitle) joinTitle.textContent = config.joinSection.title;
        if (joinIntro) joinIntro.textContent = config.joinSection.intro;

        // Subscription tiers
        const subscriptionGrid = document.querySelector('#page-subscribe .subscription-grid');
        if (subscriptionGrid) {
            subscriptionGrid.innerHTML = config.tiers.map(tier => renderTierCard(tier)).join('');
        }

        // Perks section (optional)
        if (config.perksSection) {
            const perksTitle = document.querySelectorAll('#page-subscribe .section-title')[1];
            if (perksTitle) perksTitle.textContent = config.perksSection.title;

            const perksShowcase = document.querySelector('#page-subscribe .perks-showcase');
            if (perksShowcase) {
                perksShowcase.innerHTML = config.perksSection.items.map(item => renderPerkItem(item)).join('');
            }
        } else {
            // Hide perks section if not in config
            const perksSection = document.querySelectorAll('#page-subscribe .section')[1];
            if (perksSection) perksSection.style.display = 'none';
        }

        // Social links (optional)
        if (config.socialLinks && config.socialLinks.length > 0) {
            const linksHtml = renderSocialLinks(config.socialLinks);
            const perksSection = document.querySelectorAll('#page-subscribe .section')[1];
            if (perksSection) {
                perksSection.insertAdjacentHTML('beforeend', linksHtml);
            }
        }
    }

    function renderSocialLinks(links) {
        const linksHtml = links.map(link =>
            `<a href="${link.url}" target="_blank">${link.text}</a>`
        ).join('');
        return `<div class="subscribe-links">${linksHtml}</div>`;
    }

    function renderTierCard(tier) {
        const featuredClass = tier.featured ? ' featured' : '';
        const priceSubtext = tier.priceSubtext ? `<span>${tier.priceSubtext}</span>` : '';

        const perksHtml = tier.perks.map(perk => `<li>${perk}</li>`).join('');

        const buttonsHtml = renderButtons(tier.buttons);

        return `
            <div class="subscription-card${featuredClass}" data-tier="${tier.id}">
                <div class="sub-tier">${tier.name}</div>
                <div class="sub-price">${tier.price}${priceSubtext}</div>
                <ul class="sub-perks">
                    ${perksHtml}
                </ul>
                ${buttonsHtml}
            </div>
        `;
    }

    function renderButtons(buttons) {
        if (buttons.length === 0) return '';

        // Multiple non-primary buttons go in a group
        const nonPrimaryButtons = buttons.filter(b => !b.primary);
        const primaryButtons = buttons.filter(b => b.primary);

        let html = '';

        // Render grouped non-primary buttons
        if (nonPrimaryButtons.length > 0) {
            const groupHtml = nonPrimaryButtons.map(btn => renderButton(btn)).join('');
            html += `<div class="sub-btn-group">${groupHtml}</div>`;
        }

        // Render primary buttons individually
        primaryButtons.forEach(btn => {
            html += renderButton(btn);
        });

        return html;
    }

    function renderButton(btn) {
        const primaryClass = btn.primary ? ' primary' : '';

        if (btn.type === 'link') {
            return `<a href="${btn.url}" target="_blank" class="sub-btn${primaryClass}">${btn.text}</a>`;
        } else if (btn.type === 'modal') {
            return `<button class="sub-btn${primaryClass}" onclick="openModal('${btn.modalId}')">${btn.text}</button>`;
        }

        return '';
    }

    function renderPerkItem(item) {
        return `
            <div class="perk-item">
                <div class="perk-icon">${item.icon}</div>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
        `;
    }
})();
