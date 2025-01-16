const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');
const nextPieceCanvas = document.getElementById('next-piece-canvas');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
let score = 0;
let level = 1;
let lines = 0;
let nextPiece = null;
let gameSpeed = 1000;

// Tetromino shapes
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
];

const COLORS = [
    '#00f0f0', // cyan
    '#f0f000', // yellow
    '#a000f0', // purple
    '#f0a000', // orange
    '#0000f0', // blue
    '#00f000', // green
    '#f00000', // red
];

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;
let currentPieceColor = '';

const PARTICLES = [];
const GLOW_INTENSITY = 20;
const MAX_PARTICLES = 50;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = -Math.random() * 4 - 2;
        this.gravity = 0.1;
        this.life = 1.0;
        this.fadeSpeed = 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= this.fadeSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        if (PARTICLES.length < MAX_PARTICLES) {
            PARTICLES.push(new Particle(x, y, color));
        }
    }
}

function createNewPiece() {
    if (nextPiece === null) {
        const randomIndex = Math.floor(Math.random() * SHAPES.length);
        nextPiece = new Piece(SHAPES[randomIndex], COLORS[randomIndex]);
    }
    
    currentPiece = nextPiece;
    
    // Reset position for new piece
    currentPieceX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPieceY = 0;
    
    // Create next piece
    const randomIndex = Math.floor(Math.random() * SHAPES.length);
    nextPiece = new Piece(SHAPES[randomIndex], COLORS[randomIndex]);
    
    // Draw next piece preview
    drawNextPiece();
}

function drawNextPiece() {
    if (!nextPiece) return;
    
    nextPieceCtx.fillStyle = '#1a1a1a';
    nextPieceCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    const blockSize = 20;
    const offsetX = (nextPieceCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
    const offsetY = (nextPieceCanvas.height - nextPiece.shape.length * blockSize) / 2;
    
    for (let y = 0; y < nextPiece.shape.length; y++) {
        for (let x = 0; x < nextPiece.shape[y].length; x++) {
            if (nextPiece.shape[y][x]) {
                // Draw block
                nextPieceCtx.fillStyle = nextPiece.color;
                nextPieceCtx.fillRect(
                    offsetX + x * blockSize + 1,
                    offsetY + y * blockSize + 1,
                    blockSize - 2,
                    blockSize - 2
                );

                // Add 3D effect
                nextPieceCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                nextPieceCtx.fillRect(
                    offsetX + x * blockSize + 1,
                    offsetY + y * blockSize + 1,
                    blockSize - 2,
                    3
                );
            }
        }
    }
}

function draw() {
    // Clear canvas with a dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid with subtle glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw board with glow effect
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                const color = board[y][x];
                
                // Draw glow
                ctx.shadowColor = color;
                ctx.shadowBlur = GLOW_INTENSITY;
                
                // Draw block
                ctx.fillStyle = color;
                ctx.fillRect(
                    x * BLOCK_SIZE + 1,
                    y * BLOCK_SIZE + 1,
                    BLOCK_SIZE - 2,
                    BLOCK_SIZE - 2
                );
                
                // Add shine effect
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(
                    x * BLOCK_SIZE + 1,
                    y * BLOCK_SIZE + 1,
                    BLOCK_SIZE - 2,
                    BLOCK_SIZE / 3
                );
            }
        }
    }

    // Draw current piece with glow
    if (currentPiece) {
        ctx.shadowColor = currentPiece.color;
        ctx.shadowBlur = GLOW_INTENSITY;
        ctx.fillStyle = currentPiece.color;
        
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    ctx.fillRect(
                        (currentPieceX + x) * BLOCK_SIZE + 1,
                        (currentPieceY + y) * BLOCK_SIZE + 1,
                        BLOCK_SIZE - 2,
                        BLOCK_SIZE - 2
                    );
                    
                    // Add shine effect
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(
                        (currentPieceX + x) * BLOCK_SIZE + 1,
                        (currentPieceY + y) * BLOCK_SIZE + 1,
                        BLOCK_SIZE - 2,
                        BLOCK_SIZE / 3
                    );
                }
            }
        }
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    // Update and draw particles
    for (let i = PARTICLES.length - 1; i >= 0; i--) {
        PARTICLES[i].update();
        PARTICLES[i].draw(ctx);
        if (PARTICLES[i].life <= 0) {
            PARTICLES.splice(i, 1);
        }
    }
}

function isValidMove(pieceX, pieceY, piece = currentPiece.shape) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                const newX = pieceX + x;
                const newY = pieceY + y;
                
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return false;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function mergePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[currentPieceY + y][currentPieceX + x] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // Create particles for the cleared line
            for (let x = 0; x < BOARD_WIDTH; x++) {
                createParticles(
                    x * BLOCK_SIZE + BLOCK_SIZE / 2,
                    y * BLOCK_SIZE + BLOCK_SIZE / 2,
                    board[y][x],
                    3
                );
            }
            
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            lines++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        scoreElement.textContent = score;
        linesElement.textContent = lines;
        
        // Update level every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel !== level) {
            level = newLevel;
            levelElement.textContent = level;
            gameSpeed = Math.max(100, 1000 - (level - 1) * 100);
            // Update game loop speed
            clearInterval(gameLoop);
            gameLoop = setInterval(() => {
                update();
                draw();
            }, gameSpeed);
        }
    }
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i])
    );
    
    if (isValidMove(currentPieceX, currentPieceY, rotated)) {
        currentPiece.shape = rotated;
    }
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    
    // Draw "Game Over" text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    ctx.font = '16px Arial';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
}

function update() {
    if (currentPiece === null) {
        createNewPiece();
        if (!isValidMove(currentPieceX, currentPieceY)) {
            gameOver();
            return;
        }
    }

    if (isValidMove(currentPieceX, currentPieceY + 1)) {
        currentPieceY++;
    } else {
        mergePiece();
        clearLines();
        createNewPiece();
        // Check if the new piece can be placed
        if (!isValidMove(currentPieceX, currentPieceY)) {
            gameOver();
            return;
        }
    }
}

function hardDrop() {
    let dropDistance = 0;
    while (isValidMove(currentPieceX, currentPieceY + 1)) {
        currentPieceY++;
        dropDistance++;
    }
    
    // Create particles at landing position
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                createParticles(
                    (currentPieceX + x) * BLOCK_SIZE + BLOCK_SIZE / 2,
                    (currentPieceY + y) * BLOCK_SIZE + BLOCK_SIZE / 2,
                    currentPiece.color,
                    2
                );
            }
        }
    }
    
    score += dropDistance * 2;
    scoreElement.textContent = score;
    mergePiece();
    clearLines();
    createNewPiece();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    // If game is over and space is pressed, restart the game
    if (!gameLoop && e.key === ' ') {
        initGame();
        return;
    }

    // Rest of the existing key handlers
    switch (e.key) {
        case 'ArrowLeft':
            if (isValidMove(currentPieceX - 1, currentPieceY)) {
                currentPieceX--;
            }
            break;
        case 'ArrowRight':
            if (isValidMove(currentPieceX + 1, currentPieceY)) {
                currentPieceX++;
            }
            break;
        case 'ArrowDown':
            if (isValidMove(currentPieceX, currentPieceY + 1)) {
                currentPieceY++;
                score += 1;
                scoreElement.textContent = score;
            }
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
            if (gameLoop) { // Only allow hard drop if game is running
                hardDrop();
            }
            break;
    }
    if (gameLoop) { // Only redraw if game is running
        draw();
    }
});

// Add this function for game initialization
function initGame() {
    // Reset game state
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    nextPiece = null;
    currentPiece = null;
    gameSpeed = 1000;
    
    // Update display
    scoreElement.textContent = score;
    linesElement.textContent = lines;
    levelElement.textContent = level;
    
    // Create first piece
    createNewPiece();
    
    // Clear any existing game loop
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    // Start game loop
    gameLoop = setInterval(() => {
        update();
        draw();
    }, gameSpeed);

    // Initial draw
    draw();
}

// Make sure the game starts when the page loads
window.addEventListener('load', () => {
    initGame();
});

let gameLoop = null;
initGame(); 