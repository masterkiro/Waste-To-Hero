class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu';
    this.score = 0;
    this.level = 1;
    this.timeLeft = 60;
    this.trashItems = [];
    this.trashBins = [];
    this.mouse = { x: 0, y: 0, pressed: false, dragging: null };

    this.setupCanvas();
    this.setupInput();
    this.render();
  }

  setupCanvas() {
    if (window.innerWidth < 800) {
      this.canvas.width = window.innerWidth - 40;
      this.canvas.height = 400;
    }
    this.createTrashBins();
  }

  setupInput() {
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
    const symbols = {
      'organic': '🍎',
      'anorganik': Math.random() < 0.5 ? '🥤' : '📄',
      'residu': '🧪'
    };
    const trashItem = {
      x: Math.random() * (this.canvas.width - size),
      y: -size,
      width: size,
      height: size,
      type: type,
      speed: 1 + (this.level * 0.2),
      symbol: symbols[type]
    };
    this.trashItems.push(trashItem);
  }

  update() {
    if (this.gameState !== 'playing') return;
    for (let i = this.trashItems.length - 1; i >= 0; i--) {
      const item = this.trashItems[i];
      item.y += item.speed;
      if (item.y > this.canvas.height) {
        this.trashItems.splice(i, 1);
      }
    }
    if (Math.random() < 0.007 * this.level) this.createTrashItem();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.trashBins.forEach(bin => {
      this.ctx.fillStyle = bin.color;
      this.ctx.fillRect(bin.x, bin.y, bin.width, bin.height);
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(bin.label, bin.x + bin.width / 2, bin.y + bin.height / 2);
    });
    this.trashItems.forEach(item => {
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(item.symbol, item.x, item.y);
    });
    requestAnimationFrame(() => this.render());
  }

  startGame() {
    this.score = 0;
    this.level = 1;
    this.timeLeft = 60;
    this.trashItems = [];
    this.gameState = 'playing';
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    this.startTimer();
    this.updateUI();
  }

  restartGame() { this.startGame(); }

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
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  }

  endGame() {
    clearInterval(this.gameTimer);
    this.gameState = 'gameover';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLevel').textContent = this.level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
  }

  gameLoop() {
    const loop = () => {
      this.update();
      requestAnimationFrame(loop);
    };
    loop();
  }
}

window.addEventListener('load', () => {
  const game = new Game();
  game.gameLoop();
});
