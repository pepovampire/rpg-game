// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 600;

// Player Object
const player = {
    x: 500,
    y: 400,
    width: 30,
    height: 40,
    velocityY: 0,
    velocityX: 0,
    speed: 5,
    jumpPower: 12,
    isJumping: false,
    maxHP: 100,
    hp: 100,
    level: 1,
    exp: 0,
    expNext: 100,
    gold: 0,
    damage: 5,
    color: '#00ff00'
};

// Game Areas
const areas = {
    forest: {
        name: 'Forest',
        background: '#2d5016',
        platform: 100,
        enemies: [
            { x: 200, y: 400, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin' },
            { x: 700, y: 350, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin' }
        ],
        npcs: [
            { x: 150, y: 420, width: 25, height: 35, color: '#4ecdc4', name: 'Elder', dialog: 'Welcome to the Forest! Defeat enemies to level up!' }
        ]
    },
    cave: {
        name: 'Cave',
        background: '#1a1a2e',
        platform: 100,
        enemies: [
            { x: 300, y: 400, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider' },
            { x: 600, y: 350, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider' },
            { x: 850, y: 380, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider' }
        ],
        npcs: [
            { x: 100, y: 420, width: 25, height: 35, color: '#ffd700', name: 'Dwarf', dialog: 'Beware of spiders! They are stronger than goblins.' }
        ]
    },
    mountain: {
        name: 'Mountain',
        background: '#3d3d5c',
        platform: 100,
        enemies: [
            { x: 250, y: 380, width: 40, height: 40, hp: 100, maxHP: 100, damage: 8, exp: 100, color: '#ff0000', type: 'dragon' },
            { x: 700, y: 350, width: 35, height: 35, hp: 80, maxHP: 80, damage: 7, exp: 80, color: '#ff6600', type: 'orc' }
        ],
        npcs: [
            { x: 900, y: 420, width: 25, height: 35, color: '#ff69b4', name: 'Princess', dialog: 'You are very brave! Please defeat the dragon to save our kingdom!' }
        ]
    }
};

let currentAreaName = 'forest';
let currentArea = areas[currentAreaName];
let gameState = 'playing'; // 'playing', 'dialog'
let dialogData = null;
let gravity = 0.6;
let friction = 0.8;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Jump with Z
    if (e.key.toUpperCase() === 'Z' && !player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }
    
    // Interact with SPACE
    if (e.key === ' ') {
        checkInteraction();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update Game State
function update() {
    // Horizontal Movement
    if (keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    } else if (keys['ArrowRight']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= friction;
    }

    player.x += player.velocityX;

    // Gravity and Vertical Movement
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Ground Collision
    if (player.y + player.height >= canvas.height - currentArea.platform) {
        player.y = canvas.height - currentArea.platform - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Vertical Movement (Arrow Up/Down)
    if (keys['ArrowUp']) {
        player.y -= 3;
    }
    if (keys['ArrowDown']) {
        player.y += 3;
    }

    // Keep player in bounds horizontally
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Update UI
    updateHUD();

    // Update Enemies
    updateEnemies();

    // Area transitions
    checkAreaTransition();
}

function updateEnemies() {
    currentArea.enemies.forEach((enemy, index) => {
        // Simple AI - move towards player
        if (Math.abs(enemy.x - player.x) > 5) {
            enemy.x += enemy.x < player.x ? 1.5 : -1.5;
        }

        // Basic ground collision
        enemy.y = canvas.height - currentArea.platform - 25;

        // Check collision with player
        if (checkCollision(player, enemy)) {
            if (gameState === 'playing') {
                player.hp -= enemy.damage;
                player.x -= 20; // Knockback
                if (player.hp <= 0) {
                    gameState = 'gameover';
                }
            }
        }

        // Check if player attacks enemy
        if (checkNearby(player, enemy, 60) && keys[' ']) {
            enemy.hp -= player.damage;
            if (enemy.hp <= 0) {
                currentArea.enemies.splice(index, 1);
                player.exp += enemy.exp;
                player.gold += Math.floor(enemy.exp / 10);
                checkLevelUp();
            }
        }
    });
}

function checkInteraction() {
    currentArea.npcs.forEach(npc => {
        if (checkNearby(player, npc, 80)) {
            showDialog(npc.name, npc.dialog);
        }
    });
}

function checkAreaTransition() {
    // Forest to Cave (right side)
    if (currentAreaName === 'forest' && player.x > canvas.width - 30) {
        currentAreaName = 'cave';
        currentArea = areas[currentAreaName];
        player.x = 50;
    }
    // Cave to Forest (left side)
    else if (currentAreaName === 'cave' && player.x < 30) {
        currentAreaName = 'forest';
        currentArea = areas[currentAreaName];
        player.x = canvas.width - 50;
    }
    // Cave to Mountain (right side)
    else if (currentAreaName === 'cave' && player.x > canvas.width - 30) {
        currentAreaName = 'mountain';
        currentArea = areas[currentAreaName];
        player.x = 50;
    }
    // Mountain to Cave (left side)
    else if (currentAreaName === 'mountain' && player.x < 30) {
        currentAreaName = 'cave';
        currentArea = areas[currentAreaName];
        player.x = canvas.width - 50;
    }
}

function checkLevelUp() {
    if (player.exp >= player.expNext) {
        player.level++;
        player.exp -= player.expNext;
        player.expNext = Math.floor(player.expNext * 1.5);
        player.maxHP += 20;
        player.hp = player.maxHP;
        player.damage += 2;
        showDialog('Level Up!', `You reached Level ${player.level}!\nHP +20, Damage +2`);
    }
}

function updateHUD() {
    document.getElementById('hp').textContent = Math.max(0, player.hp);
    document.getElementById('level').textContent = player.level;
    document.getElementById('exp').textContent = player.exp;
    document.getElementById('exp-next').textContent = player.expNext;
    document.getElementById('area').textContent = currentArea.name;
    document.getElementById('gold').textContent = player.gold;
    document.getElementById('damage').textContent = player.damage;
}

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkNearby(rect1, rect2, distance) {
    const dx = (rect1.x + rect1.width / 2) - (rect2.x + rect2.width / 2);
    const dy = (rect1.y + rect1.height / 2) - (rect2.y + rect2.height / 2);
    return Math.sqrt(dx * dx + dy * dy) < distance;
}

// Dialog System
function showDialog(title, message) {
    gameState = 'dialog';
    dialogData = { title, message };
    const dialogBox = document.getElementById('dialog-box');
    const dialogContent = document.getElementById('dialog-content');
    const dialogButtons = document.getElementById('dialog-buttons');
    
    dialogContent.innerHTML = `<strong>${title}</strong><br>${message}`;
    dialogButtons.innerHTML = '<button class="dialog-btn" onclick="closeDialog()">OK</button>';
    dialogBox.classList.remove('hidden');
}

function closeDialog() {
    gameState = 'playing';
    document.getElementById('dialog-box').classList.add('hidden');
}

// Drawing Functions
function draw() {
    // Clear canvas with area background
    ctx.fillStyle = currentArea.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, canvas.height - currentArea.platform, canvas.width, currentArea.platform);

    // Draw platforms
    ctx.fillStyle = '#888888';
    ctx.fillRect(100, 300, 250, 20);
    ctx.fillRect(600, 250, 250, 20);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw enemies
    currentArea.enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy health bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 10, (enemy.hp / enemy.maxHP) * enemy.width, 4);
    });

    // Draw NPCs
    currentArea.npcs.forEach(npc => {
        ctx.fillStyle = npc.color;
        ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        
        // Draw NPC head
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(npc.x + npc.width / 2, npc.y - 12, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw interaction indicator
        if (checkNearby(player, npc, 80)) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SPACE', npc.x + npc.width / 2, npc.y - 25);
        }
    });

    // Draw area transitions
    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    
    if (currentAreaName === 'forest') {
        ctx.fillText('→ Cave', canvas.width - 50, 20);
    } else if (currentAreaName === 'cave') {
        ctx.fillText('← Forest', 10, 20);
        ctx.fillText('→ Mountain', canvas.width - 80, 20);
    } else if (currentAreaName === 'mountain') {
        ctx.fillText('← Cave', 10, 20);
    }

    // Draw player health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x, player.y - 10, player.width, 4);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y - 10, (player.hp / player.maxHP) * player.width, 4);
}

// Game Loop
function gameLoop() {
    update();
    draw();

    if (gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 50);
        
        if (keys['r'] || keys['R']) {
            resetGame();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Reset Game
function resetGame() {
    player.x = 500;
    player.y = 400;
    player.hp = player.maxHP;
    player.exp = 0;
    player.level = 1;
    player.expNext = 100;
    player.gold = 0;
    player.damage = 5;
    currentAreaName = 'forest';
    currentArea = areas[currentAreaName];
    gameState = 'playing';
    closeDialog();
    
    // Reset enemies
    areas.forest.enemies = [
        { x: 200, y: 400, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin' },
        { x: 700, y: 350, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin' }
    ];
    areas.cave.enemies = [
        { x: 300, y: 400, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider' },
        { x: 600, y: 350, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider' },
        { x: 850, y: 380, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider' }
    ];
    areas.mountain.enemies = [
        { x: 250, y: 380, width: 40, height: 40, hp: 100, maxHP: 100, damage: 8, exp: 100, color: '#ff0000', type: 'dragon' },
        { x: 700, y: 350, width: 35, height: 35, hp: 80, maxHP: 80, damage: 7, exp: 80, color: '#ff6600', type: 'orc' }
    ];
}

// Start Game
gameLoop();
updateHUD();
