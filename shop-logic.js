// Variable, um die aktuell gewählte Kategorie zu speichern (wichtig für Refresh nach Kauf)
let currentShopCategory = 'skins';

// 2. Initialisierung des Inventars
if (!gameData.inventory) {
    gameData.inventory = JSON.parse(localStorage.getItem('robo_inventory')) || [];
}

// --- STEUERUNGS-FUNKTIONEN (Öffnen/Schließen) ---

function openShop() {
    const overlay = document.getElementById('shop-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        updateScoreDisplay(); // Score überall (auch im Shop) aktualisieren
        renderShop('skins');  // Mit Skins starten
    }
}

function closeShop() {
    const overlay = document.getElementById('shop-overlay');
    if (overlay) overlay.style.display = 'none';
}

// --- LOGIK-FUNKTIONEN ---

function filterShop(category, buttonElement) {
    currentShopCategory = category; // Kategorie merken

    // 1. Alle Buttons im Shop-Navi auf "inaktiv" setzen
    // Nutze hier .shop-cat-btn, damit es genau deine Shop-Buttons trifft
    document.querySelectorAll('.shop-cat-btn').forEach(btn => btn.classList.remove('active'));
    
    // 2. Den geklickten Button aktivieren (falls das Element übergeben wurde)
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
    
    // 3. Den Grid-Inhalt neu zeichnen
    renderShop(category); 
}

function renderShop(category = 'skins') {
    const grid = document.getElementById('shop-grid'); 
    const coinDisplay = document.getElementById('shop-coin-count');
    
    if (coinDisplay) coinDisplay.innerText = gameData.score;
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = SHOP_ITEMS[category]; 

    filtered.forEach(item => {
        // ZUSTANDS-PRÜFUNG
        const isOwned = gameData.inventory.includes(item.id);
        const isActive = (gameData.activeSkin === item.id) || (gameData.activeTrail == item.id); 
        const canAfford = gameData.score >= item.price;

        // BUTTON-LOGIK FESTLEGEN
        let btnText = '';
        let btnClass = 'buy-btn';

        if (isActive) {
            btnText = 'AKTIV';
            btnClass += ' active-skin'; // Neue CSS-Klasse
        } else if (isOwned) {
            btnText = 'AUSWÄHLEN';
            btnClass += ' owned';       // Blaue CSS-Klasse
        } else {
            btnText = item.price + ' 🪙 Kaufen';
            if (!canAfford) btnClass += ' disabled';
        }

        // VISUAL (BILD ODER ICON)
        const visual = item.img 
            ? `<img src="${item.img}" style="width: 60px; height: 60px; object-fit: contain;">` 
            : `<div style="font-size: 40px">${item.icon}</div>`;

        const card = document.createElement('div');
        card.className = 'shop-item';
        card.innerHTML = `
            ${visual}
            <h3>${item.name}</h3>
            <button class="${btnClass}" 
                    onclick="buyItem('${item.id}', ${item.price})" 
                    ${(!isOwned && !canAfford) ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;
        grid.appendChild(card);
    });
}

// Diese Funktion am Ende der shop-logic.js hinzufügen oder ersetzen
function buyItem(id, price) {
    const isOwned = gameData.inventory.includes(id);

    // FALL A: Item bereits im Besitz -> Ausrüsten
    if (isOwned) {
        if (id.startsWith('trail_')) {
            gameData.activeTrail = id;
            localStorage.setItem('robo_activeTrail', id);
        } else if (id.startsWith('skin_') || id === 'default') {
            gameData.activeSkin = id;
            localStorage.setItem('robo_activeSkin', id);
            updatePlayerAppearance(); // Visuelle Änderung im Spiel
        }
        renderShop(currentShopCategory); // Shop-Button Text ändern (z.B. zu "Aktiv")
        return;
    }

    // FALL B: Item neu kaufen
    if (gameData.score >= price) {
        gameData.score -= price;
        gameData.inventory.push(id);
        
        // Speichern
        localStorage.setItem('robo_score', gameData.score);
        localStorage.setItem('robo_inventory', JSON.stringify(gameData.inventory));
        
        // UI Update
        updateScoreDisplay(); 
        renderShop(currentShopCategory);
    } else {
        alert("Nicht genug Münzen!");
    }
}

// Diese Funktion sorgt dafür, dass Robi im Spiel sein Aussehen ändert
function updatePlayerAppearance() {
    const playerImg = document.getElementById('player'); 
    if (!playerImg) {
        console.error("Bildelement 'player' nicht gefunden!");
        return;
    }

    // Hole die ID (aus dem Spielstand oder dem Speicher)
    const activeSkinId = gameData.activeSkin || localStorage.getItem('robo_activeSkin');

    let selectedItem = null;

    // Suche in den SHOP_ITEMS (Skins-Kategorie)
    if (activeSkinId && SHOP_ITEMS.skins) {
        selectedItem = SHOP_ITEMS.skins.find(item => item.id === activeSkinId);
    }

    // Wenn ein Skin gefunden wurde UND er ein Bild hat, nimm das.
    // Sonst nimm das Standardbild 'robi_right.png'
    if (selectedItem && selectedItem.img) {
        playerImg.src = selectedItem.img;
    } else {
        playerImg.src = 'robi_right.png';
    }
}
