/* ============================================
   ACDb - Dev Tool (Code Generator)
   ============================================ */

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    function getAllGameNames() {
        const gameOrder = [
            "Assassin's Creed", "Assassin's Creed II", "Assassin's Creed Brotherhood",
            "Assassin's Creed Revelations", "Assassin's Creed III", "Assassin's Creed III: Liberation",
            "Assassin's Creed IV: Black Flag", "Assassin's Creed Rogue", "Assassin's Creed Unity",
            "Assassin's Creed Chronicles: China", "Assassin's Creed Chronicles: India",
            "Assassin's Creed Chronicles: Russia", "Assassin's Creed Syndicate",
            "Assassin's Creed Origins", "Assassin's Creed Odyssey",
            "Assassin's Creed Valhalla", "Assassin's Creed Mirage", "Assassin's Creed Shadows",
            "Assassin's Creed (Movie)", "General"
        ];
        return gameOrder;
    }

    function openDevTool() {
        // Populate game dropdown
        const gameSelect = document.getElementById('devGame');
        gameSelect.innerHTML = '<option value="">Select game...</option>';
        getAllGameNames().forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g;
            gameSelect.appendChild(opt);
        });

        // Populate type dropdown
        const typeSelect = document.getElementById('devType');
        typeSelect.innerHTML = '<option value="">Select type...</option>';
        const types = [...new Set(AC_DATABASE.map(i => i.type).filter(Boolean))].sort();
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            typeSelect.appendChild(opt);
        });

        // Clear form
        document.getElementById('devName').value = '';
        document.getElementById('devGame').value = '';
        document.getElementById('devGame').style.display = '';
        document.getElementById('devYear').value = '';
        document.getElementById('devCategory').value = '';
        document.getElementById('devType').value = '';
        document.getElementById('devDescription').value = '';
        document.getElementById('devContents').value = '';
        document.getElementById('devImagePath').value = '';
        document.getElementById('devNewGame').checked = false;
        document.getElementById('devNewGameFields').style.display = 'none';
        document.getElementById('devNewGameName').value = '';
        document.getElementById('devNewGameShort').value = '';
        document.getElementById('devCodeOutput').value = '';

        A.dom.devToolOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('devName').focus();
    }

    function closeDevTool() {
        A.dom.devToolOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function generateCode() {
        const name = document.getElementById('devName').value.trim();
        const isNewGame = document.getElementById('devNewGame').checked;
        const newGameName = document.getElementById('devNewGameName').value.trim();
        const newGameShort = document.getElementById('devNewGameShort').value.trim();
        const game = isNewGame ? newGameName : document.getElementById('devGame').value;
        const year = document.getElementById('devYear').value;
        const category = document.getElementById('devCategory').value;
        const type = document.getElementById('devType').value;
        const description = document.getElementById('devDescription').value.trim();
        const contents = document.getElementById('devContents').value.trim();
        const imagePath = document.getElementById('devImagePath').value.trim();

        let code = '';

        // database.js entry
        code += '// database.js — add before the closing ];\n';
        code += '  {\n';
        code += `    "name": ${JSON.stringify(name || 'Item Name')},\n`;
        code += `    "game": ${JSON.stringify(game || 'Game Name')},\n`;
        code += `    "year": ${year || 2025},\n`;
        code += `    "category": ${JSON.stringify(category || 'Category')},\n`;
        code += `    "description": ${JSON.stringify(description)},\n`;
        code += `    "contents": ${JSON.stringify(contents)},\n`;
        code += `    "type": ${JSON.stringify(type || category || 'Type')}\n`;
        code += '  },';

        // images.js entry
        if (imagePath) {
            code += '\n\n// images.js — add before the closing };\n';
            code += `    ${JSON.stringify(name || 'Item Name')}: ${JSON.stringify(imagePath)},`;
        }

        // New game code
        if (isNewGame && newGameName) {
            code += '\n\n// app.js — add to SHORT_GAME_NAMES object\n';
            code += `    ${JSON.stringify(newGameName)}: ${JSON.stringify(newGameShort || newGameName)},`;
            code += '\n\n// app.js — add to gameOrder array in initFilters()\n';
            code += `    ${JSON.stringify(newGameName)},`;
            code += '\n\n// app.js — add to getAllGameNames() in dev tool\n';
            code += `    ${JSON.stringify(newGameName)},`;
        }

        document.getElementById('devCodeOutput').value = code;
    }

    // Expose on namespace
    A.openDevTool = openDevTool;
    A.closeDevTool = closeDevTool;
    A.generateCode = generateCode;

})();
