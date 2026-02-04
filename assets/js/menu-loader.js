// ===== MENU CONFIG LOADER =====
// Loads menu items from config/menu-config.json for easy editing
// Icons loaded separately from config/menu-icons.json

let menuConfig = null;
let menuIcons = null;
let drinkDetails = {};

async function loadMenuConfig() {
    try {
        // Load menu config and icons in parallel
        const [configResponse, iconsResponse] = await Promise.all([
            fetch('config/menu-config.json'),
            fetch('config/menu-icons.json')
        ]);
        menuConfig = await configResponse.json();
        menuIcons = await iconsResponse.json();

        // Build drinkDetails object from config
        menuConfig.drinks.forEach(drink => {
            drinkDetails[drink.id] = {
                name: drink.name,
                desc: drink.fullDesc,
                extras: drink.extras.map(e => `<p>${e}</p>`).join('')
            };
        });

        // Render menu cards
        renderMenuCards();

        // Re-initialize drink card click handlers after rendering
        initDrinkCardHandlers();

        return menuConfig;
    } catch (error) {
        console.error('Failed to load menu config:', error);
        return null;
    }
}

function renderMenuCards() {
    const drinksScroll = document.querySelector('.drinks-scroll');
    if (!drinksScroll || !menuConfig) return;

    // Clear existing cards
    drinksScroll.innerHTML = '';

    // Render each drink from config
    menuConfig.drinks.forEach(drink => {
        const card = document.createElement('div');
        card.className = 'drink-card';
        card.setAttribute('data-drink', drink.id);

        // Use image if provided, otherwise fall back to SVG icon
        let illustrationContent;
        if (drink.image) {
            illustrationContent = `<img src="${drink.image}" alt="${drink.name}" class="drink-image" loading="lazy">`;
        } else {
            const iconSvg = menuIcons[drink.icon] || menuIcons['surprise'];
            illustrationContent = iconSvg;
        }

        card.innerHTML = `
            <div class="drink-illustration">
                ${illustrationContent}
            </div>
            <div class="drink-info">
                <div class="drink-name">${drink.name}</div>
                <div class="drink-desc">${drink.shortDesc}</div>
            </div>
        `;

        drinksScroll.appendChild(card);
    });

    // Apply theme-appropriate colors to cards
    updateCardColors();
}

// Update card colors based on current theme
function updateCardColors() {
    if (!window.getLogoColor) return;

    document.querySelectorAll('.drink-card[data-drink]').forEach(card => {
        const drinkId = card.dataset.drink;
        const color = window.getLogoColor(drinkId);
        if (color) {
            card.style.setProperty('--drink-color', color);
            card.style.borderColor = color;
        }
    });
}

// Expose function for theme toggle to call
window.updateMenuCardColors = updateCardColors;

// Listen for theme changes to update card colors
const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            updateCardColors();
        }
    });
});

// Start observing theme changes on document element
themeObserver.observe(document.documentElement, { attributes: true });

function initDrinkCardHandlers() {
    document.querySelectorAll('.drink-card[data-drink]').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const drinkId = card.dataset.drink;

            if (window.setLiquidDrink) window.setLiquidDrink(drinkId);
            if (window.setSpiceColors) window.setSpiceColors(drinkId);
            if (window.setLogoColor) window.setLogoColor(drinkId);

            document.querySelectorAll('.drink-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            if (window.showDrinkDetail) window.showDrinkDetail(drinkId, card);
        });
    });
}

// Load menu config when DOM is ready
document.addEventListener('DOMContentLoaded', loadMenuConfig);
