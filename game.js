// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000;
canvas.height = 600;

// Particle System for effects
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // gravity
        this.life--;
    }

    draw() {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

let particles = [];

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
    color: '#00ff00',
    attackCooldown: 0,
    shield: 0,
    attackRange: 60
};

// Game Areas with more content
const areas = {
    forest: {
        name: 'Forest',
        background: '#2d5016',
        platform: 100,
        enemies: [
            { x: 200, y: 400, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin', speed: 1.5 },
            { x: 700, y: 350, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin', speed: 1.5 }
        ],
        npcs: [
            { x: 150, y: 420, width: 25, height: 35, color: '#4ecdc4', name: 'Elder', dialog: 'Welcome to the Forest! Defeat enemies to level up! →' }
        ],
        powerUps: [
            { x: 300, y: 200, type: 'health', size: 15, color: '#ff6b6b' }
        ]
    },
    cave: {
        name: 'Cave',
        background: '#1a1a2e',
        platform: 100,
        enemies: [
            { x: 300, y: 400, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider', speed: 2 },
            { x: 600, y: 350, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider', speed: 2 },
            { x: 850, y: 380, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider', speed: 2 }
        ],
        npcs: [
            { x: 100, y: 420, width: 25, height: 35, color: '#ffd700', name: 'Dwarf', dialog: 'Beware of spiders! They are stronger than goblins. →' }
        ],
        powerUps: [
            { x: 400, y: 200, type: 'damage', size: 15, color: '#ffaa00' }
        ]
    },
    mountain: {
        name: 'Mountain',
        background: '#3d3d5c',
        platform: 100,
        enemies: [
            { x: 250, y: 380, width: 40, height: 40, hp: 100, maxHP: 100, damage: 8, exp: 100, color: '#ff0000', type: 'dragon', speed: 1.2 },
            { x: 700, y: 350, width: 35, height: 35, hp: 80, maxHP: 80, damage: 7, exp: 80, color: '#ff6600', type: 'orc', speed: 1.8 }
        ],
        npcs: [
            { x: 900, y: 420, width: 25, height: 35, color: '#ff69b4', name: 'Princess', dialog: 'Please defeat the dragon to save our kingdom! →' }
        ],
        powerUps: [
            { x: 500, y: 200, type: 'shield', size: 15, color: '#00ffff' }
        ]
    },
    volcano: {
        name: 'Volcano',
        background: '#661a00',
        platform: 100,
        enemies: [
            { x: 200, y: 400, width: 40, height: 40, hp: 150, maxHP: 150, damage: 10, exp: 150, color: '#ff3300', type: 'lava_beast', speed: 1 },
            { x: 600, y: 350, width: 35, height: 35, hp: 120, maxHP: 120, damage: 9, exp: 120, color: '#ff6600', type: 'fire_spirit', speed: 2.5 },
            { x: 850, y: 380, width: 32, height: 32, hp: 100, maxHP: 100, damage: 8, exp: 100, color: '#ff9900', type: 'magma_golem', speed: 1.3 }
        ],
        npcs: [
            { x: 100, y: 420, width: 25, height: 35, color: '#ffaa00', name: 'Wizard', dialog: 'The volcano heart burns with ancient power! Be careful!' }
        ],
        powerUps: [
            { x: 300, y: 200, type: 'damage', size: 15, color: '#ffaa00' },
            { x: 700, y: 250, type: 'health', size: 15, color: '#ff6b6b' }
        ]
    },
    kingdom: {
        name: 'Kingdom',
        background: '#4d7a8a',
        platform: 100,
        enemies: [
            { x: 300, y: 400, width: 45, height: 45, hp: 200, maxHP: 200, damage: 12, exp: 250, color: '#8b0000', type: 'dark_lord', speed: 1.5 }
        ],
        npcs: [
            { x: 100, y: 420, width: 25, height: 35, color: '#ffd700', name: 'King', dialog: 'You are the chosen one! Defeat the Dark Lord and save the kingdom!' }
        ],
        powerUps: [
            { x: 400, y: 150, type: 'health', size: 18, color: '#ff6b6b' },
            { x: 600, y: 150, type: 'damage', size: 18, color: '#ffaa00' }
        ],
        boss: true
    }
};

let currentAreaName = 'forest';
let currentArea = areas[currentAreaName];
let gameState = 'playing'; // 'playing', 'dialog', 'gameover', 'victory'
let dialogData = null;
let gravity = 0.6;
let friction = 0.8;
let score = 0;
let enemiesDefeated = 0;

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key.toUpperCase() === 'Z' && !player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }
    
    if (e.key === ' ') {
        checkInteraction();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Create particle effect
function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 3;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            30
        ));
    }
}

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

    // Update attack cooldown
    if (player.attackCooldown > 0) player.attackCooldown--;

    // Update UI
    updateHUD();

    // Update Enemies
    updateEnemies();

    // Check power-ups
    checkPowerUps();

    // Area transitions
    checkAreaTransition();

    // Update particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update());
}

function updateEnemies() {
    currentArea.enemies.forEach((enemy, index) => {
        // Improved AI - move towards player with awareness
        const distance = Math.abs(enemy.x - player.x);
        if (distance > 5) {
            const moveSpeed = enemy.speed || 1.5;
            enemy.x += enemy.x < player.x ? moveSpeed : -moveSpeed;
        }

        // Basic ground collision
        enemy.y = canvas.height - currentArea.platform - 25;

        // Check collision with player
        if (checkCollision(player, enemy)) {
            if (gameState === 'playing') {
                let damage = enemy.damage;
                if (player.shield > 0) {
                    damage = Math.max(1, Math.floor(damage / 2));
                    player.shield--;
                }
                player.hp -= damage;
                player.x -= 20; // Knockback
                createParticles(player.x, player.y, '#ff0000', 3);
                if (player.hp <= 0) {
                    gameState = 'gameover';
                }
            }
        }

        // Check if player attacks enemy
        if (checkNearby(player, enemy, player.attackRange) && keys[' '] && player.attackCooldown === 0) {
            enemy.hp -= player.damage;
            player.attackCooldown = 10;
            createParticles(enemy.x, enemy.y, '#ffff00', 4);
            if (enemy.hp <= 0) {
                currentArea.enemies.splice(index, 1);
                player.exp += enemy.exp;
                player.gold += Math.floor(enemy.exp / 10);
                score += enemy.exp;
                enemiesDefeated++;
                checkLevelUp();
                
                // Check for victory
                if (currentAreaName === 'kingdom' && currentArea.enemies.length === 0) {
                    gameState = 'victory';
                }
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

function checkPowerUps() {
    currentArea.powerUps.forEach((powerUp, index) => {
        if (checkCollision(player, { x: powerUp.x - powerUp.size/2, y: powerUp.y - powerUp.size/2, width: powerUp.size, height: powerUp.size })) {
            switch(powerUp.type) {
                case 'health':
                    player.hp = Math.min(player.maxHP, player.hp + 30);
                    break;
                case 'damage':
                    player.damage += 3;
                    break;
                case 'shield':
                    player.shield = Math.min(5, player.shield + 2);
                    break;
            }
            createParticles(powerUp.x, powerUp.y, powerUp.color, 6);
            currentArea.powerUps.splice(index, 1);
        }
    });
}

function checkAreaTransition() {
    if (currentAreaName === 'forest' && player.x > canvas.width - 30) {
        currentAreaName = 'cave';
        currentArea = areas[currentAreaName];
        player.x = 50;
    } else if (currentAreaName === 'cave' && player.x < 30) {
        currentAreaName = 'forest';
        currentArea = areas[currentAreaName];
        player.x = canvas.width - 50;
    } else if (currentAreaName === 'cave' && player.x > canvas.width - 30) {
        currentAreaName = 'mountain';
        currentArea = areas[currentAreaName];
        player.x = 50;
    } else if (currentAreaName === 'mountain' && player.x < 30) {
        currentAreaName = 'cave';
        currentArea = areas[currentAreaName];
        player.x = canvas.width - 50;
    } else if (currentAreaName === 'mountain' && player.x > canvas.width - 30) {
        currentAreaName = 'volcano';
        currentArea = areas[currentAreaName];
        player.x = 50;
    } else if (currentAreaName === 'volcano' && player.x < 30) {
        currentAreaName = 'mountain';
        currentArea = areas[currentAreaName];
        player.x = canvas.width - 50;
    } else if (currentAreaName === 'volcano' && player.x > canvas.width - 30) {
        currentAreaName = 'kingdom';
        currentArea = areas[currentAreaName];
        player.x = 50;
    } else if (currentAreaName === 'kingdom' && player.x < 30) {
        currentAreaName = 'volcano';
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
        createParticles(player.x, player.y, '#ffff00', 8);
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
    document.getElementById('shield-stat').textContent = player.shield;
    document.getElementById('score').textContent = score;
    document.getElementById('enemies-defeated').textContent = enemiesDefeated;
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
    ctx.fillStyle = currentArea.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, canvas.height - currentArea.platform, canvas.width, currentArea.platform);

    // Draw platforms
    ctx.fillStyle = '#888888';
    ctx.fillRect(100, 300, 250, 20);
    ctx.fillRect(600, 250, 250, 20);

    // Draw power-ups
    currentArea.powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw shield if active
    if (player.shield > 0) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 40, 0, Math.PI * 2);
        ctx.stroke();
    }

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
        
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(npc.x + npc.width / 2, npc.y - 12, 10, 0, Math.PI * 2);
        ctx.fill();

        if (checkNearby(player, npc, 80)) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SPACE', npc.x + npc.width / 2, npc.y - 25);
        }
    });

    // Draw area transitions
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
        ctx.fillText('→ Volcano', canvas.width - 80, 20);
    } else if (currentAreaName === 'volcano') {
        ctx.fillText('← Mountain', 10, 20);
        ctx.fillText('→ Kingdom', canvas.width - 80, 20);
    } else if (currentAreaName === 'kingdom') {
        ctx.fillText('← Volcano', 10, 20);
    }

    // Draw player health bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x, player.y - 10, player.width, 4);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y - 10, (player.hp / player.maxHP) * player.width, 4);

    // Draw particles
    particles.forEach(p => p.draw());
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
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 100);
        
        if (keys['r'] || keys['R']) {
            resetGame();
        }
    }

    if (gameState === 'victory') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText(`Enemies Defeated: ${enemiesDefeated}`, canvas.width / 2, canvas.height / 2 + 100);
        ctx.fillText('Press R to Play Again', canvas.width / 2, canvas.height / 2 + 150);
        
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
    player.shield = 0;
    player.attackCooldown = 0;
    currentAreaName = 'forest';
    currentArea = areas[currentAreaName];
    gameState = 'playing';
    score = 0;
    enemiesDefeated = 0;
    particles = [];
    closeDialog();
    
    // Reset all areas
    areas.forest.enemies = [
        { x: 200, y: 400, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin', speed: 1.5 },
        { x: 700, y: 350, width: 25, height: 25, hp: 30, maxHP: 30, damage: 3, exp: 25, color: '#ff6b6b', type: 'goblin', speed: 1.5 }
    ];
    areas.cave.enemies = [
        { x: 300, y: 400, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider', speed: 2 },
        { x: 600, y: 350, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider', speed: 2 },
        { x: 850, y: 380, width: 30, height: 30, hp: 50, maxHP: 50, damage: 5, exp: 50, color: '#d91e63', type: 'spider', speed: 2 }
    ];
    areas.mountain.enemies = [
        { x: 250, y: 380, width: 40, height: 40, hp: 100, maxHP: 100, damage: 8, exp: 100, color: '#ff0000', type: 'dragon', speed: 1.2 },
        { x: 700, y: 350, width: 35, height: 35, hp: 80, maxHP: 80, damage: 7, exp: 80, color: '#ff6600', type: 'orc', speed: 1.8 }
    ];
    areas.volcano.enemies = [
        { x: 200, y: 400, width: 40, height: 40, hp: 150, maxHP: 150, damage: 10, exp: 150, color: '#ff3300', type: 'lava_beast', speed: 1 },
        { x: 600, y: 350, width: 35, height: 35, hp: 120, maxHP: 120, damage: 9, exp: 120, color: '#ff6600', type: 'fire_spirit', speed: 2.5 },
        { x: 850, y: 380, width: 32, height: 32, hp: 100, maxHP: 100, damage: 8, exp: 100, color: '#ff9900', type: 'magma_golem', speed: 1.3 }
    ];
    areas.kingdom.enemies = [
        { x: 300, y: 400, width: 45, height: 45, hp: 200, maxHP: 200, damage: 12, exp: 250, color: '#8b0000', type: 'dark_lord', speed: 1.5 }
    ];
    areas.forest.powerUps = [{ x: 300, y: 200, type: 'health', size: 15, color: '#ff6b6b' }];
    areas.cave.powerUps = [{ x: 400, y: 200, type: 'damage', size: 15, color: '#ffaa00' }];
    areas.mountain.powerUps = [{ x: 500, y: 200, type: 'shield', size: 15, color: '#00ffff' }];
    areas.volcano.powerUps = [
        { x: 300, y: 200, type: 'damage', size: 15, color: '#ffaa00' },
        { x: 700, y: 250, type: 'health', size: 15, color: '#ff6b6b' }
    ];
    areas.kingdom.powerUps = [
        { x: 400, y: 150, type: 'health', size: 18, color: '#ff6b6b' },
        { x: 600, y: 150, type: 'damage', size: 18, color: '#ffaa00' }
    ];
}

// Start Game
gameLoop();
updateHUD();
