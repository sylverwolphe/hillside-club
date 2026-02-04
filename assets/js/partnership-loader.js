// ===== PARTNERSHIP INFO CARDS LOADER =====
// Loads info card content from config/partnership-config.json

(function loadPartnershipContent() {
    fetch('config/partnership-config.json')
        .then(response => response.json())
        .then(config => {
            renderInfoCards(config.infoCards);
        })
        .catch(error => {
            console.error('Error loading partnership config:', error);
        });

    function renderInfoCards(infoCards) {
        const infoCardContainer = document.getElementById('partnershipInfoCard');
        if (!infoCardContainer) return;

        // Clear existing content
        infoCardContainer.innerHTML = '';

        // Render each info card
        Object.keys(infoCards).forEach(category => {
            const card = infoCards[category];
            const isDefault = category === 'default';
            const cardHtml = renderInfoCard(category, card, isDefault);
            infoCardContainer.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function renderInfoCard(category, card, isDefault) {
        let html = `<div class="info-card-content" data-category="${category}"${isDefault ? '' : ' style="display: none;"'}>`;

        // Title
        html += `<h3 class="info-card-title">${card.title}</h3>`;

        // Intro paragraph
        html += `<p>${card.intro}</p>`;

        // Investor tier (special section for investor category)
        if (card.tier) {
            html += `
                <div class="investor-tier">
                    <div class="tier-amount">${card.tier.amount}</div>
                    <div class="tier-equity">${card.tier.equity}</div>
                    <div class="tier-label">${card.tier.label}</div>
                </div>
            `;
        }

        // List section
        if (card.items && card.items.length > 0) {
            if (card.listTitle) {
                html += `<h4>${card.listTitle}</h4>`;
            }
            html += '<ul>';
            card.items.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }

        // Note at the bottom
        if (card.note) {
            html += `<p class="info-note">${card.note}</p>`;
        }

        html += '</div>';
        return html;
    }
})();
