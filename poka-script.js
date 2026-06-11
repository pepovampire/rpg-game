// POKA Game Engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

// Character Definitions
const characterDefinitions = {
    knight: {
        name: 'The Knight',
        maxHP: 120,
        attack: 8,
        defense: 6,
        speed: 4,
        jumpPower: 10,
        color: '#7cb342',
        skill: 'Dash Strike',
        skillCooldown: 60,
        specialAbility: 'Can perform 3 consecutive slashes'
    },
    quirrel: {
        name: 'Quirrel',
        maxHP: 90,
        attack: 9,
        defense: 4,
        speed: 6,
        jumpPower: 12,
        color: '#42a5f5',
        skill: 'Shadow Step',
        skillCooldown: 40,
        specialAbility: 'Dash and disappear from enemy radar'
    },
    hornet: {
        name: 'Hornet',
        maxHP: 100,
        attack: 10,
        defense: 3,
        speed: 7,
        jumpPower: 14,
        color: '#ff6b9d',
        skill: 'Aerial Combo',
        skillCooldown: 45,
        specialAbility: 'Chain attacks in mid-air'
    },
    zote: {
        name: 'Zote',
        maxHP: 140,
        attack: 5,
        defense: 8,
        speed: 3,
        jumpPower: 8,
        color: '#ffd54f',
        skill: 'Shield Bash',
        skillCooldown: 70,
        specialAbility: 'Block damage at low HP'
    },
    ghost: {
        name: 'The Ghost',
        maxHP: 110,
        attack: 7,
        defense: 5,
        speed: 5,
        jumpPower: 11,
        color: '#9c27b0',
        skill: 'Shadow Blast',
        skillCooldown: 55,
        specialAbility: 'Summon projectiles'
    },
    cloth: {
        name: 'Cloth',
        maxHP: 105,
        attack: 7,
        defense: 6,
        speed: 5.5,
        jumpPower: 10,
        color: '#e91e63',
        skill: 'Evasion Roll',
        skillCooldown: 50,
        specialAbility: 'Dodge and counter-attack'
    }
};

// Enemy Definitions
const enemyTypes = {
    husk: {
        name: 'Husk',
        hp: 25,
        attack: 3,
        speed: 2,
        size: 25,
        color: '#ff6b6b',
        exp: 30
    },
    virus: {
        name: 'Virus',
        hp: 40,
        attack: 5,
        speed: 3,
        size: 30,
        color: '#d91e63',
        exp: 50
    },
    keeper: {
        name: 'Keeper',
        hp: 60,
        attack: 7,
        speed: 2.5,
        size: 35,
        color: '#9c27b0',
        exp: 80
    },
    watcher: {
        name: 'Watcher',
        hp: 80,
        attack: 8,
        speed: 4,
        size: 40,
        color: '#ff0000',
        exp: 120
    }
};

// Game State
let selectedCharacter = null;
let gameState = 'selection'; // 'selection', 'playing', 'gameover', 'victory'
let player = null;
let currentLevel = 1;
let currentArea = 'Kingdom\'s Edge';
let enemies = [];
let projectiles = [];
let particles = [];

// Input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key.toLowerCase() === 'x' && player && !player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Character Selection
document.querySelectorAll('.character-card').forEach(card => {
    card.querySelector('.select-btn').addEventListener('click', () => {
        const character = card.dataset.character;
        selectCharacter(character);
    });
});

function selectCharacter(characterKey) {
    selectedCharacter = characterKey;
    initializeGame();
    startGame();
}

// Initialize Game
function initializeGame() {
    const charDef = characterDefinitions[selectedCharacter];
    
    player = {
        x: canvas.width / 2,
        y: canvas.height - 200,
        width: 30,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        isAttacking: false,
        maxHP: charDef.maxHP,
        hp: charDef.maxHP,
        attack: charDef.attack,
        defense: charDef.defense,
        speed: charDef.speed,
        jumpPower: charDef.jumpPower,
        color: charDef.color,
        level: 1,
        exp: 0,
        expNext: 100,
        essence: 0,
        skillCooldown: 0,
        skillMaxCooldown: charDef.skillCooldown,
        attackCooldown: 0,
        comboCnt: 0,
        name: charDef.name
    };

    // Spawn initial enemies
    spawnEnemies(3);
}

function startGame() {
    document.getElementById('character-selection').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    document.getElementById('character-name').textContent = player.name;
    updateHUD();
    gameLoop();
}

// Spawn Enemies
function spawnEnemies(count) {
    const enemyTypeList = Object.keys(enemyTypes);
    
    for (let i = 0; i < count; i++) {
        const type = enemyTypeList[Math.floor(Math.random() * enemyTypeList.length)];
        const def = enemyTypes[type];
        
        enemies.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: canvas.height - 300,
            width: def.size,
            height: def.size,
            type: type,
            name: def.name,
            hp: def.hp,
            maxHP: def.hp,
            attack: def.attack,
            speed: def.speed,
            color: def.color,
            exp: def.exp,
            velocityX: (Math.random() - 0.5) * def.speed,
            velocityY: 0,
            attackCooldown: 0,
            isJumping: false
        });
    }
}

// Particle System
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
        this.vy += 0.4;
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

function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 4;
        particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            color,
            30
        ));
    }
}

// Update Game
function update() {
    if (gameState !== 'playing') return;

    // Player movement
    if (keys['arrowleft']) {
        player.velocityX = -player.speed;
    } else if (keys['arrowright']) {
        player.velocityX = player.speed;
    } else {
        player.velocityX *= 0.8;
    }

    player.x += player.velocityX;
    player.velocityY += 0.6;
    player.y += player.velocityY;

    // Ground collision
    if (player.y + player.height >= canvas.height - 50) {
        player.y = canvas.height - 50 - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Boundary
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Attacks
    if (keys['c'] && !player.isAttacking && player.attackCooldown === 0) {
        playerAttack();
    }

    if (keys['v'] && player.skillCooldown === 0) {
        playerSpecialSkill();
    }

    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.skillCooldown > 0) player.skillCooldown--;

    // Update enemies
    updateEnemies();

    // Update projectiles
    projectiles = projectiles.filter(p => p.life > 0);
    projectiles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        // Check collision with enemies
        enemies.forEach((enemy, index) => {
            if (checkCollision(p, enemy)) {
                enemy.hp -= player.attack + 2;
                createParticles(p.x, p.y, '#ffff00', 3);
                p.life = 0;

                if (enemy.hp <= 0) {
                    enemies.splice(index, 1);
                    player.exp += enemy.exp;
                    player.essence += 5;
                    checkLevelUp();
                }
            }
        });
    });

    // Update particles
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update());

    updateHUD();

    // Check victory
    if (enemies.length === 0 && currentLevel < 5) {
        currentLevel++;
        spawnEnemies(3 + currentLevel);
    } else if (enemies.length === 0 && currentLevel === 5) {
        gameState = 'victory';
    }
}

function playerAttack() {
    player.isAttacking = true;
    player.attackCooldown = 15;

    // Check enemy collision
    enemies.forEach((enemy, index) => {
        if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 80) {
            enemy.hp -= player.attack;
            createParticles(enemy.x, enemy.y, '#ffaa00', 4);

            if (enemy.hp <= 0) {
                enemies.splice(index, 1);
                player.exp += enemy.exp;
                player.essence += 5;
                checkLevelUp();
            }
        }
    });
}

function playerSpecialSkill() {
    player.skillCooldown = player.skillMaxCooldown;

    const charDef = characterDefinitions[selectedCharacter];

    switch (selectedCharacter) {
        case 'knight':
            // Dash Strike - 3 consecutive attacks
            for (let i = 0; i < 3; i++) {
                enemies.forEach((enemy, index) => {
                    if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 100) {
                        enemy.hp -= player.attack * 1.5;
                        createParticles(enemy.x, enemy.y, '#7cb342', 5);

                        if (enemy.hp <= 0) {
                            enemies.splice(index, 1);
                            player.exp += enemy.exp;
                            player.essence += 10;
                            checkLevelUp();
                        }
                    }
                });
            }
            break;

        case 'quirrel':
            // Shadow Step - Teleport and damage
            player.x += Math.random() * 200 - 100;
            player.y -= 50;
            enemies.forEach((enemy, index) => {
                if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 120) {
                    enemy.hp -= player.attack * 2;
                    createParticles(enemy.x, enemy.y, '#42a5f5', 6);

                    if (enemy.hp <= 0) {
                        enemies.splice(index, 1);
                        player.exp += enemy.exp;
                        player.essence += 10;
                        checkLevelUp();
                    }
                }
            });
            break;

        case 'hornet':
            // Aerial Combo - Multiple hits
            for (let i = 0; i < 5; i++) {
                projectiles.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(i * Math.PI / 2.5) * 8,
                    vy: -5 + i * 2,
                    life: 60,
                    damage: player.attack
                });
            }
            break;

        case 'zote':
            // Shield Bash - Temporary invulnerability
            player.shield = 3;
            createParticles(player.x, player.y, '#ffd54f', 8);
            break;

        case 'ghost':
            // Shadow Blast - Projectile barrage
            for (let i = 0; i < 8; i++) {
                projectiles.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(i * Math.PI / 4) * 6,
                    vy: Math.sin(i * Math.PI / 4) * 6,
                    life: 60,
                    damage: player.attack
                });
            }
            break;

        case 'cloth':
            // Evasion Roll - Dodge and counter
            player.x += 150;
            createParticles(player.x, player.y, '#e91e63', 7);
            enemies.forEach((enemy, index) => {
                if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 100) {
                    enemy.hp -= player.attack * 2.5;
                    createParticles(enemy.x, enemy.y, '#e91e63', 5);

                    if (enemy.hp <= 0) {
                        enemies.splice(index, 1);
                        player.exp += enemy.exp;
                        player.essence += 10;
                        checkLevelUp();
                    }
                }
            });
            break;
    }
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // AI - Move towards player
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distance > 10) {
            enemy.velocityX = (player.x - enemy.x) / distance * enemy.speed;
        }

        enemy.x += enemy.velocityX;

        // Gravity
        enemy.velocityY += 0.6;
        enemy.y += enemy.velocityY;

        // Ground collision
        if (enemy.y + enemy.height >= canvas.height - 50) {
            enemy.y = canvas.height - 50 - enemy.height;
            enemy.velocityY = 0;
            enemy.isJumping = false;
        }

        // Attack player
        if (distance < 60 && enemy.attackCooldown === 0) {
            let damage = enemy.attack - (player.defense / 2);
            if (player.shield && player.shield > 0) {
                damage /= 2;
                player.shield--;
            }
            player.hp -= Math.max(1, damage);
            enemy.attackCooldown = 30;
            createParticles(player.x, player.y, '#ff0000', 3);

            if (player.hp <= 0) {
                gameState = 'gameover';
            }
        }

        if (enemy.attackCooldown > 0) enemy.attackCooldown--;
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkLevelUp() {
    if (player.exp >= player.expNext) {
        player.level++;
        player.exp -= player.expNext;
        player.expNext = Math.floor(player.expNext * 1.5);
        player.maxHP += 20;
        player.hp = player.maxHP;
        player.attack += 2;
        createParticles(player.x, player.y, '#ffff00', 10);
    }
}

// Drawing
function draw() {
    // Background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw player HP bar
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.x, player.y - 15, player.width, 5);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y - 15, (player.hp / player.maxHP) * player.width, 5);

    // Draw shield indicator
    if (player.shield && player.shield > 0) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 50, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Enemy HP bar
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 3);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x, enemy.y - 10, (enemy.hp / enemy.maxHP) * enemy.width, 3);
    });

    // Draw projectiles
    projectiles.forEach(p => {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw particles
    particles.forEach(p => p.draw());

    // Draw area info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Area: ${currentArea} - Level ${currentLevel}`, 20, 30);
    ctx.fillText(`Enemies: ${enemies.length}`, 20, 50);
}

// Game Over / Victory Screen
function drawGameState() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = gameState === 'victory' ? '#00ff00' : '#ff0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameState === 'victory' ? 'VICTORY!' : 'GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Level: ${player.level}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText(`Essence: ${player.essence}`, canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 2 + 100);
}

function updateHUD() {
    document.getElementById('hp').textContent = Math.max(0, Math.floor(player.hp));
    document.getElementById('max-hp').textContent = player.maxHP;
    document.getElementById('level').textContent = player.level;
    document.getElementById('exp').textContent = Math.floor(player.exp);
    document.getElementById('exp-next').textContent = Math.floor(player.expNext);
    document.getElementById('essence').textContent = player.essence;
    document.getElementById('damage').textContent = player.attack;
    document.getElementById('skill-name').textContent = characterDefinitions[selectedCharacter].skill;
    document.getElementById('area').textContent = `${currentArea} - Level ${currentLevel}`;
}

// Game Loop
function gameLoop() {
    update();
    draw();

    if (gameState !== 'playing') {
        drawGameState();
    }

    requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
});
