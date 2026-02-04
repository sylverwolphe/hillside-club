// ===== COLLAB LOGOS LOADER =====
// Loads collab logos from partners/partners.json

async function loadCollabLogos() {
    const container = document.getElementById('partnersLogos');
    if (!container) return;

    try {
        const response = await fetch('partners/partners.json');
        const data = await response.json();

        // Filter out the _readme entry and check if we have real collabs
        const collabs = data.partners.filter(p => p.logo && p.logo !== 'example-logo.png');

        if (collabs.length === 0) {
            // Keep the placeholder if no collabs
            return;
        }

        // Clear placeholder
        container.innerHTML = '';

        // Add each collab logo
        collabs.forEach(collab => {
            const logoWrapper = document.createElement('a');
            logoWrapper.className = 'partner-logo';
            logoWrapper.title = collab.name;

            if (collab.url) {
                logoWrapper.href = collab.url;
                logoWrapper.target = '_blank';
                logoWrapper.rel = 'noopener noreferrer';
            } else {
                logoWrapper.style.cursor = 'default';
            }

            const img = document.createElement('img');
            img.src = `partners/${collab.logo}`;
            img.alt = collab.name;
            img.loading = 'lazy';

            logoWrapper.appendChild(img);
            container.appendChild(logoWrapper);
        });
    } catch (error) {
        console.log('No collab logos configured yet');
    }
}

document.addEventListener('DOMContentLoaded', loadCollabLogos);
