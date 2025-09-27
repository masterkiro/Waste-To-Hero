class Game {
            constructor() {
                this.canvas = document.getElementById('gameCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.gameState = 'menu'; // menu, playing, paused, gameover
                this.score = 0;
                this.level = 1;
                this.timeLeft = 60;
                this.gameTimer = null;
                this.entities = [];
                this.trashBins = [];
                this.trashItems = [];
                this.mouse = { x: 0, y: 0, pressed: false, dragging: null };
                this.touch = { x: 0, y: 0, active: false, dragging: null };
                
                this.setupCanvas();
                this.setupInput();
                this.loadHighScore();
                this.render();
            }
            
            setupCanvas() {
                // Adjust canvas size for mobile
                if (window.innerWidth < 800) {
                    this.canvas.width = window.innerWidth - 40;
                    this.canvas.height = 400;
                }
                
                this.createTrashBins();
            }
            
            setupInput() {
                // Touch events
                this.canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const rect = this.canvas.getBoundingClientRect();
                    this.touch.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
                    this.touch.y = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
                    this.touch.active = true;
                    this.handleTouchStart();
                });
                
                this.canvas.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const rect = this.canvas.getBoundingClientRect();
                    this.touch.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
                    this.touch.y = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
                    this.handleTouchMove();
                });
                
                this.canvas.addEventListener('touchend', () => {
                    this.touch.active = false;
                    this.handleTouchEnd();
                });
                
                // Mouse events
                this.canvas.addEventListener('mousedown', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                    this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
                    this.mouse.pressed = true;
                    this.handleMouseDown();
                });
                
                this.canvas.addEventListener('mousemove', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                    this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
                    this.handleMouseMove();
                });
                
                this.canvas.addEventListener('mouseup', () => {
                    this.mouse.pressed = false;
                    this.handleMouseUp();
                });
                
                // Button events
                document.getElementById('startButton').addEventListener('click', () => this.startGame());
                document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
                document.getElementById('menuStartButton').addEventListener('click', () => this.startGame());
                document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
            }
            
            createTrashBins() {
                const colors = ['#4caf50', '#ffeb3b', '#f44336'];
                const types = ['organic', 'anorganik', 'residu'];
                const labels = ['Organik', 'Anorganik', 'Residu'];
                
                for (let i = 0; i < 3; i++) {
                    this.trashBins.push({
                        x: i * (this.canvas.width / 3) + 40,
                        y: this.canvas.height - 80,
                        width: (this.canvas.width / 3) - 60,
                        height: 70,
                        color: colors[i],
                        type: types[i],
                        label: labels[i]
                    });
                }
            }
            
            createTrashItem() {
                const types = ['organic', 'anorganik', 'residu'];
                const type = types[Math.floor(Math.random() * types.length)];
                const size = 30 + Math.random() * 20;
                
                const trashItem = {
                    x: Math.random() * (this.canvas.width - size),
                    y: -size,
                    width: size,
                    height: size,
                    type: type,
                    speed: 1 + (this.level * 0.2),
                    color: this.getColorForType(type),
                    symbol: this.getSymbolForType(type)
                };
                
                this.trashItems.push(trashItem);
            }
            
            getColorForType(type) {
                const colors = {
                    'organic': '#4caf50',
                    'anorganik': '#ffeb3b',
                    'residu': '#f44336'
                };
                return colors[type] || '#000000';
            }
            
            getSymbolForType(type) {
                const symbols = {
                    'organic': '🍎',
                    'anorganik': '🥤',
                    'residu': '🧪'
                };
                return symbols[type] || '🗑️';
            }
            
            handleMouseDown() {
                if (this.gameState !== 'playing') return;
                
                for (let i = this.trashItems.length - 1; i >= 0; i--) {
                    const item = this.trashItems[i];
                    if (this.isPointInRect(this.mouse.x, this.mouse.y, item)) {
                        this.mouse.dragging = item;
                        break;
                    }
                }
            }
            
            handleMouseMove() {
                if (this.mouse.dragging && this.mouse.pressed) {
                    this.mouse.dragging.x = this.mouse.x - this.mouse.dragging.width / 2;
                    this.mouse.dragging.y = this.mouse.y - this.mouse.dragging.height / 2;
                }
            }
            
            handleMouseUp() {
                if (this.mouse.dragging) {
                    this.checkTrashDisposal(this.mouse.dragging);
                    this.mouse.dragging = null;
                }
            }
            
            handleTouchStart() {
                if (this.gameState !== 'playing') return;
                
                for (let i = this.trashItems.length - 1; i >= 0; i--) {
                    const item = this.trashItems[i];
                    if (this.isPointInRect(this.touch.x, this.touch.y, item)) {
                        this.touch.dragging = item;
                        break;
                    }
                }
            }
            
            handleTouchMove() {
                if (this.touch.dragging && this.touch.active) {
                    this.touch.dragging.x = this.touch.x - this.touch.dragging.width / 2;
                    this.touch.dragging.y = this.touch.y - this.touch.dragging.height / 2;
                }
            }
            
            handleTouchEnd() {
                if (this.touch.dragging) {
                    this.checkTrashDisposal(this.touch.dragging);
                    this.touch.dragging = null;
                }
            }
            
            isPointInRect(x, y, rect) {
                return x >= rect.x && x <= rect.x + rect.width &&
                       y >= rect.y && y <= rect.y + rect.height;
            }
            
            checkTrashDisposal(trashItem) {
                for (const bin of this.trashBins) {
                    if (this.checkCollision(trashItem, bin)) {
                        if (bin.type === trashItem.type) {
                            // Correct disposal
                            this.score += 10;
                            this.playSound('correct');
                            this.trashItems.splice(this.trashItems.indexOf(trashItem), 1);
                            
                            // Level up every 100 points
                            if (this.score % 100 === 0) {
                                this.level++;
                                this.playSound('levelup');
                            }
                            
                            this.updateUI();
                            return;
                        }
                    }
                }
            }
            
            checkCollision(obj1, obj2) {
                return obj1.x < obj2.x + obj2.width &&
                       obj1.x + obj1.width > obj2.x &&
                       obj1.y < obj2.y + obj2.height &&
                       obj1.y + obj1.height > obj2.y;
            }
            
            update(deltaTime) {
                if (this.gameState !== 'playing') return;
                
                // Move trash items down
                for (let i = this.trashItems.length - 1; i >= 0; i--) {
                    const item = this.trashItems[i];
                    item.y += item.speed;
                    
                    // Remove items that fall off the bottom
                    if (item.y > this.canvas.height) {
                        this.trashItems.splice(i, 1);
                        this.score = Math.max(0, this.score - 5);
                        this.updateUI();
                        this.playSound('wrong');
                    }
                }
                
                // Add new trash items
                if (Math.random() < 0.02 * this.level) {
                    this.createTrashItem();
                }
            }
            
            render() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw background
                this.ctx.fillStyle = '#f8f9fa';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw trash bins
                this.trashBins.forEach(bin => {
                    this.ctx.fillStyle = bin.color;
                    this.ctx.fillRect(bin.x, bin.y, bin.width, bin.height);
                    
                    // Draw bin label
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(bin.label, bin.x + bin.width / 2, bin.y + bin.height / 2 + 5);
                    
                    // Draw bin symbol
                    this.ctx.font = '20px Arial';
                    this.ctx.fillText('🗑️', bin.x + bin.width / 2, bin.y + bin.height / 2 - 10);
                });
                
                // Draw trash items
                this.trashItems.forEach(item => {
                    this.ctx.fillStyle = item.color;
                    this.ctx.fillRect(item.x, item.y, item.width, item.height);
                    
                    // Draw trash symbol
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(item.symbol, item.x + item.width / 2, item.y + item.height / 2);
                });
                
                // Draw dragged item on top
                if (this.mouse.dragging) {
                    const item = this.mouse.dragging;
                    this.ctx.fillStyle = item.color;
                    this.ctx.fillRect(item.x, item.y, item.width, item.height);
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillText(item.symbol, item.x + item.width / 2, item.y + item.height / 2);
                }
                
                if (this.touch.dragging) {
                    const item = this.touch.dragging;
                    this.ctx.fillStyle = item.color;
                    this.ctx.fillRect(item.x, item.y, item.width, item.height);
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillText(item.symbol, item.x + item.width / 2, item.y + item.height / 2);
                }
                
                requestAnimationFrame(() => this.render());
            }
            
            startGame() {
                if (this.gameState === 'menu' || this.gameState === 'gameover') {
                    this.score = 0;
                    this.level = 1;
                    this.timeLeft = 60;
                    this.trashItems = [];
                    this.gameState = 'playing';
                    
                    document.getElementById('menuScreen').classList.add('hidden');
                    document.getElementById('gameOverScreen').classList.add('hidden');
                    
                    this.startTimer();
                    this.updateUI();
                    this.playSound('start');
                }
            }
            
            togglePause() {
                if (this.gameState === 'playing') {
                    this.gameState = 'paused';
                    clearInterval(this.gameTimer);
                    document.getElementById('pauseButton').textContent = 'Lanjut';
                } else if (this.gameState === 'paused') {
                    this.gameState = 'playing';
                    this.startTimer();
                    document.getElementById('pauseButton').textContent = 'Jeda';
                }
            }
            
            startTimer() {
                clearInterval(this.gameTimer);
                this.gameTimer = setInterval(() => {
                    this.timeLeft--;
                    document.getElementById('timeLeft').textContent = this.timeLeft;
                    
                    if (this.timeLeft <= 0) {
                        this.endGame();
                    }
                }, 1000);
            }
            
            endGame() {
                clearInterval(this.gameTimer);
                this.gameState = 'gameover';
                
                document.getElementById('finalScore').textContent = this.score;
                document.getElementById('finalLevel').textContent = this.level;
                document.getElementById('gameOverScreen').classList.remove('hidden');
                
                this.saveHighScore();
                this.playSound('gameover');
            }
            
            restartGame() {
                this.startGame();
            }
            
            updateUI() {
                document.getElementById('score').textContent = this.score;
                document.getElementById('level').textContent = this.level;
            }
            
            playSound(type) {
                // Simple sound effects using Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                switch(type) {
                    case 'correct':
                        oscillator.frequency.value = 523.25; // C5
                        gainNode.gain.value = 0.1;
                        oscillator.start();
                        setTimeout(() => oscillator.stop(), 200);
                        break;
                    case 'wrong':
                        oscillator.frequency.value = 196.00; // G3
                        gainNode.gain.value = 0.1;
                        oscillator.start();
                        setTimeout(() => oscillator.stop(), 200);
                        break;
                    case 'levelup':
                        oscillator.frequency.value = 783.99; // G5
                        gainNode.gain.value = 0.1;
                        oscillator.start();
                        setTimeout(() => {
                            oscillator.frequency.value = 1046.50; // C6
                        }, 100);
                        setTimeout(() => oscillator.stop(), 300);
                        break;
                    case 'gameover':
                        oscillator.frequency.value = 261.63; // C4
                        gainNode.gain.value = 0.1;
                        oscillator.start();
                        setTimeout(() => {
                            oscillator.frequency.value = 196.00; // G3
                        }, 200);
                        setTimeout(() => {
                            oscillator.frequency.value = 146.83; // D3
                        }, 400);
                        setTimeout(() => oscillator.stop(), 600);
                        break;
                    case 'start':
                        oscillator.frequency.value = 659.25; // E5
                        gainNode.gain.value = 0.1;
                        oscillator.start();
                        setTimeout(() => {
                            oscillator.frequency.value = 783.99; // G5
                        }, 100);
                        setTimeout(() => {
                            oscillator.frequency.value = 1046.50; // C6
                        }, 200);
                        setTimeout(() => oscillator.stop(), 300);
                        break;
                }
            }
            
            saveHighScore() {
                const highScore = Math.max(this.getHighScore(), this.score);
                localStorage.setItem('trashGameHighScore', highScore);
                this.updateHighScoreDisplay();
            }
            
            getHighScore() {
                return parseInt(localStorage.getItem('trashGameHighScore') || '0');
            }
            
            loadHighScore() {
                this.updateHighScoreDisplay();
            }
            
            updateHighScoreDisplay() {
                document.getElementById('highScoreDisplay').textContent = 
                    `Skor Tertinggi: ${this.getHighScore()}`;
            }
            
            gameLoop() {
                const now = Date.now();
                let lastTime = now;
                
                const loop = () => {
                    const currentTime = Date.now();
                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;
                    
                    this.update(deltaTime);
                    requestAnimationFrame(loop);
                };
                
                loop();
            }
        }
        
        // Initialize game when page loads
        window.addEventListener('load', () => {
            const game = new Game();
            game.gameLoop();
        });