// game.js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const uiScore = document.getElementById('score');
const gameOver = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    jet.x = canvas.width / 2;
    jet.y = canvas.height - 100;
});

// Player (real jet-shaped)
let jet = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 40,
    speed: 7,
    bullets: [],
    score: 0,
    powerLevel: 1 // New: Power-up level for upgrades
};

// Enemies (red spacecraft)
let enemies = [];
let spawnTimer = 0;
const ENEMY_TYPE = 'spacecraft'; // Change to 'aliens' for purple tentacles

// Power-ups
let powerUps = [];
let powerUpTimer = 0;

// Background stars (galaxy effect)
let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 0.5 + 0.1
    });
}

// Controls (smooth and responsive)
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    e.preventDefault();
});

function update() {
    // Move jet
    if (keys['ArrowLeft'] && jet.x > 0) jet.x -= jet.speed;
    if (keys['ArrowRight'] && jet.x < canvas.width - jet.width) jet.x += jet.speed;
    if (keys['ArrowUp'] && jet.y > 0) jet.y -= jet.speed;
    if (keys['ArrowDown'] && jet.y < canvas.height - jet.height) jet.y += jet.speed;
    if (keys['Space'] && jet.bullets.length < 15) {
        shootBullet();
    }

    // Update bullets (with power level)
    jet.bullets = jet.bullets.filter(b => b.y > -10);
    jet.bullets.forEach(b => b.y -= 10 * jet.powerLevel); // Faster with higher power

    // Spawn enemies
    spawnTimer++;
    if (spawnTimer > 20) {
        enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: -50,
            width: 50,
            height: 50,
            speed: 3 + Math.random() * 3,
            health: 1
        });
        spawnTimer = 0;
    }

    // Spawn power-ups (new feature)
    powerUpTimer++;
    if (powerUpTimer > 300) { // Every 5 seconds
        powerUps.push({
            x: Math.random() * canvas.width,
            y: -20,
            width: 30,
            height: 30,
            speed: 2
        });
        powerUpTimer = 0;
    }

    // Move enemies, stars, and power-ups
    enemies = enemies.filter(e => e.y < canvas.height);
    enemies.forEach(e => e.y += e.speed);

    stars.forEach(s => s.y += s.speed);
    stars = stars.filter(s => s.y < canvas.height);
    if (stars.length < 100) {
        stars.push({
            x: Math.random() * canvas.width,
            y: -10,
            size: Math.random() * 4 + 1,
            speed: Math.random() * 0.5 + 0.1
        });
    }

    powerUps = powerUps.filter(p => p.y < canvas.height);
    powerUps.forEach(p => p.y += p.speed);

    // Collisions (bullets vs enemies)
    jet.bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
            if (b.x > e.x - 5 && b.x < e.x + e.width + 5 && b.y > e.y && b.y < e.y + e.height) {
                e.health--;
                if (e.health <= 0) {
                    enemies.splice(ei, 1);
                    jet.score += 15;
                    uiScore.textContent = jet.score;
                }
                jet.bullets.splice(bi, 1);
            }
        });
    });

    // Jet collision (game over)
    enemies.forEach(e => {
        if (jet.x - jet.width / 2 < e.x + e.width &&
            jet.x + jet.width / 2 > e.x &&
            jet.y - jet.height / 2 < e.y + e.height &&
            jet.y + jet.height / 2 > e.y) {
            finalScore.textContent = jet.score;
            gameOver.classList.remove('hidden');
            jet.score = 0;
            enemies = [];
            jet.bullets = [];
            jet.powerLevel = 1; // Reset power on game over
            powerUps = [];
            jet.x = canvas.width / 2;
            jet.y = canvas.height - 100;
        }
    });

    // Power-up collection
    powerUps.forEach((p, pi) => {
        if (jet.x - jet.width / 2 < p.x + p.width &&
            jet.x + jet.width / 2 > p.x &&
            jet.y - jet.height / 2 < p.y + p.height &&
            jet.y + jet.height / 2 > p.y) {
            jet.powerLevel = Math.min(jet.powerLevel + 1, 3); // Max power level 3
            powerUps.splice(pi, 1);
            // Visual feedback (optional, add sound or flash later)
            console.log(`Power Up! Level: ${jet.powerLevel}`);
        }
    });
}

function draw() {
    // Clear canvas with galaxy effect
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw jet (real jet shape, silver with blue accents)
    ctx.fillStyle = '#C0C0C0'; // Silver body
    ctx.beginPath();
    ctx.moveTo(jet.x, jet.y - jet.height / 2); // Nose
    ctx.lineTo(jet.x - jet.width / 2, jet.y + jet.height / 2); // Left wing tip
    ctx.lineTo(jet.x - jet.width / 3, jet.y); // Left body
    ctx.lineTo(jet.x + jet.width / 3, jet.y); // Right body
    ctx.lineTo(jet.x + jet.width / 2, jet.y + jet.height / 2); // Right wing tip
    ctx.fill();
    ctx.fillStyle = '#00CED1'; // Blue accents
    ctx.fillRect(jet.x - jet.width / 4, jet.y - 5, jet.width / 2, 5); // Cockpit

    // Draw bullets
    ctx.fillStyle = '#FF4444';
    jet.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y - 5, 4, 10 * jet.powerLevel); // Longer bullets with power
    });

    // Draw enemies (red spacecraft)
    ctx.fillStyle = '#FF0000';
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(e.x + e.width / 2, e.y); // Top
        ctx.lineTo(e.x, e.y + e.height); // Left bottom
        ctx.lineTo(e.x + e.width / 4, e.y + e.height / 2); // Left wing
        ctx.lineTo(e.x + 3 * e.width / 4, e.y + e.height / 2); // Right wing
        ctx.lineTo(e.x + e.width, e.y + e.height); // Right bottom
        ctx.fill();
    });

    // Draw power-ups (yellow orbs)
    ctx.fillStyle = '#FFFF00';
    powerUps.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw score and power level
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px Arial';
    ctx.fillText(`Score: ${jet.score}`, 20, 50);
    ctx.fillText(`Power: ${jet.powerLevel}/3`, 20, 90);
}

function shootBullet() {
    jet.bullets.push({ x: jet.x + jet.width / 2 - 2, y: jet.y - jet.height });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOver.classList.add('hidden');
    jet.score = 0;
    uiScore.textContent = '0';
    enemies = [];
    jet.bullets = [];
    jet.powerLevel = 1;
    powerUps = [];
    jet.x = canvas.width / 2;
    jet.y = canvas.height - 100;
}

gameLoop();