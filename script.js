// Full updated script.js with fun fact random at game over

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu';
    this.score = 0;
    this.level = 1;
    this.timeLeft = 60;
    this.gameTimer = null;
    this.trashBins = [];
    this.trashItems = [];
    this.mouse = { x:0, y:0, pressed:false, dragging:null };
    this.touch = { x:0, y:0, active:false, dragging:null };

    this.funFacts = [
      "Sampah organik seperti sisa makanan bisa jadi kompos, tapi kalau tercampur plastik atau baterai, kompos bisa tercemar.",
      "Masker bekas, baterai, dan limbah kimia termasuk sampah B3, jadi harus dipisahkan agar tidak mencemari lingkungan.",
      "Reduce lebih penting daripada Recycle karena bisa mencegah timbulnya sampah sejak awal dan mengurangi energi pengolahan.",
      "Sampah plastik butuh ratusan tahun terurai, makanya penting dipilah agar tidak mencemari sampah organik.",
      "Kalau organik dan anorganik tercampur, proses daur ulang jadi lebih sulit dan bisa mencemari lingkungan.",
      "Tempat sampah hijau untuk organik, kuning untuk anorganik, dan merah untuk residu atau B3 berbahaya."
    ];

    this.setupCanvas();
    this.setupInput();
    this.loadHighScore();
    this.render();
  }

  // ... (the rest of the class code remains the same as before, unchanged)

  endGame(){
    clearInterval(this.gameTimer);
    this.gameState = 'gameover';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLevel').textContent = this.level;
    const fact = this.funFacts[Math.floor(Math.random() * this.funFacts.length)];
    document.getElementById('funFact').textContent = `💡 Fun Fact: ${fact}`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    this.saveHighScore();
    this.playSound('gameover');
  }
}

window.addEventListener('load', ()=>{
  const game = new Game();
  game.gameLoop();
});